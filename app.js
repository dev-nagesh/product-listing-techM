// Constants
const PRODUCTS_API = "https://fakestoreapi.com/products";
const ERRORS = {
    NO_DATA: "No Data found",
    API_ERROR: "Something went wrong. Please try again.!",
    PRICE_FILTER_ERROR: "Price range is not valid"
}
const SORT_OPTIONS=[
    {value:"price-l-h", title:"Price: Low to High"},
    {value:"price-h-l", title:"Price: High to Low"},
    {value:"a-z", title:"A-Z"},
    {value:"z-a", title:"Z-A"}
]
const ITEMS_PER_PAGE = 10;
const CURRENCY_SYMBOL= "$";
// Constants
//Variables
let masterProducts=[];
let products=[];
let totalProducts=0;
let products_errors={};
let categories=[];
//Variables

//HTML Elements
let productsWrapper = document.querySelector(".list-wrapper");
let categoriesWrapper = document.querySelector(".categories ul");
let loadMore = document.getElementById("load-more");
let totalResults = document.getElementById('total');
//console.log(productsWrapper);
const listWrapper=document.querySelector('.list-wrapper');
const listItem = document.querySelector(".list-item");
const priceInputs = document.querySelectorAll(".price-filter input");
const mobileMenuContainer = document.querySelector(".mobile-menu-container")
//HTML Elements

for (let i = 0; i < priceInputs.length; i++) {
    priceInputs[i].addEventListener("input", e => {
        applyfilters();
    })
}

//Shimmer UI Nodes
//console.log(listWrapper,listItem);
for(let i=0; i<10; i++){
    listWrapper.append(listItem.cloneNode(true));
}
//Shimmer UI Nodes

/**
 * cleanData  funciton is used to sanitize the input
 * @param {*} input 
 * @returns 
 */
const cleanData = (input)=>{
    return DOMPurify.sanitize(input);
}

/**
 * fetchProducts function is used to fetch the Products from API.
 */
const fetchProducts = async ()=>{
    try{
        const data = await fetch(PRODUCTS_API);
        const response = await data.json();
        if(response && response.length){
            masterProducts = response;
            products = response;
            arrangeItemsPerPage();
            //console.log(products);
            //let list ='';
            buildCategories();

        }
        else{
            products =[];
            masterProducts =[];
            products_errors=setError(products_errors,'NO_DATA');
            displayErrors();
        }
    }
    catch(error){
        console.log(error);
        products_errors=setError(products_errors,'API_ERROR');
        products =[];
        masterProducts =[];
        displayErrors();
    }
}
/**
 * applyfilters function is used to apply all filters such as filtering, searching and sorting
 */
function applyfilters(){
    // const formData = new FormData(filterform);
    // const formProps = Object.fromEntries(formData);
    let categoriesEle=Array.from(document.getElementsByName('category'));
    categories= categoriesEle.filter(el=>el.checked).map(el=>el.value);
    if(categories.length){
        products = masterProducts.filter(product => categories.includes(product.category));
    }
    else{
        products = masterProducts;
    }
    if(priceInputs){
        applyPriceFilter();
    }
    const searchKeyword = document.getElementById("search");
    if(searchKeyword.value){
        keywordSearch(searchKeyword.value,{arrangeItems:false})
    }
    let sortOption = document.querySelector('select[name=sorting]');
    if(sortOption.value){
        applySorting(sortOption.value, {arrangeItems:false})
    }
    arrangeItemsPerPage();
}
/**
 * arrangeItemsPerPage function is used to configure only specific items per page
 * @param {*} clearWrapper 
 */
const arrangeItemsPerPage = (clearWrapper)=>{
    let displayProducts = []
    if(products.length > ITEMS_PER_PAGE){
        displayProducts = products.slice(0,ITEMS_PER_PAGE);
    }
    else
        displayProducts = products;
    buildProducts(displayProducts,clearWrapper);
    showHideLoadMore(products,displayProducts.length);
}
/**
 * applySorting is responsible for sorting the product items
 * @param {*} sortOption 
 * @param {*} inputObj 
 */
function applySorting(sortOption,inputObj={arrangeItems:true}){
    sortOption = document.querySelector('select[name=sorting]');
    switch(sortOption.value){
        case 'price-l-h':
            products = products.sort((a,b)=> a.price - b.price);
        break;
        case 'price-h-l':
            products = products.sort((a,b)=> b.price - a.price);
        break;
        case 'a-z':
            products = products.sort((a,b)=>{
                const titleA = a.title.toLowerCase(); 
                const titleB = b.title.toLowerCase();
                if (titleA < titleB) {
                    return -1;
                }
                if (titleA > titleB) {
                    return 1;
                }
                return 0;
            });
        break;
        case 'z-a':
            products = products.sort((a,b)=>{
                const titleA = a.title.toLowerCase(); 
                const titleB = b.title.toLowerCase();
                if (titleA > titleB) {
                    return -1;
                }
                if (titleA < titleB) {
                    return 1;
                }
                return 0;
            });
        break;
        default:
    }
    if(inputObj.arrangeItems){
        arrangeItemsPerPage(true);
    }
}
/**
 * buildProducts function is used to bind the products to UI
 * @param {*} products 
 * @param {*} clearWrapper 
 */
const buildProducts = (products=masterProducts, clearWrapper=true)=>{
    if(clearWrapper){
        productsWrapper.innerText='';
    }
    for(let product of products){
        const listDiv=document.createElement("div");
        listDiv.classList.add('list-item');
        listDiv.setAttribute("role","listitem");
        listDiv.setAttribute("tabIndex",0);
        listDiv.innerHTML=cleanData(`
        <div class="product-image-container">
            <img alt="Product Image for ${product.title}" src="${product.image}" class="product-image">
        </div>
        <div class="product-info">
            <div class="product-title" aria-label="Title ${product.title}">
                ${product.title}
            </div>
            <div class="product-price" aria-label="Price of the pruduct ${product.price} dollars">
                ${CURRENCY_SYMBOL+product.price} 
            </div>
            <div class="favourite-wrapper" tabIndex="0">
                <img alt="Add to favourites" src="./favourite.svg"/>
            </div>
        </div>`);
        console.log(listDiv);
        productsWrapper.appendChild(listDiv);
    }
}
/**
 * buildCategories is used to bind the categories to filters
 */
const buildCategories = ()=>{
    categoriesWrapper.innerHTML="";
    for(let product of masterProducts){
        // Categories.
        let categoryIndex=categories.findIndex(category => product.category == category);
        console.log(categoryIndex);
        if(categoryIndex == -1){
            categories.push(product.category);
            const categoryLi = document.createElement("li");
            categoryLi.innerHTML=`<input type="checkbox" value="${product.category}" name="category" onchange="applyfilters()"> ${product.category}`;
            categoriesWrapper.appendChild(categoryLi)
        }
    }
}



/**
 * toggleFilters function is used to hide/show the categories/filters
 */
function toggleFilters(){
    // let query = window.matchMedia("(min-width: 480px)");
    // if(query.matches){
        let filterContainer = document.getElementById("filter-container");
        filterContainer.classList.toggle("show-mobile-filters")
        //categories.style.display='none';
        if(!filterContainer.style.display || filterContainer.style.display == 'none'){
            filterContainer.style.display='block';
            filterContainer.setAttribute('aria-expanded',true);
        }
        else{
            filterContainer.style.display='none';
            filterContainer.setAttribute('aria-expanded',false);
        }
    // }
    console.log(filterContainer.style.display);
}
/**
 * setTotalProducts is used to set the results count on UI
 * @param {*} total 
 */
const setTotalProducts=(total)=>{
    totalResults.innerText =`${total} of ${products.length} results`;
    totalProducts = total;
}
/**
 * bindSortOptions is used to bind the Sorting options from the constants
 */
const bindSortOptions = ()=>{
    let sortEle = document.querySelector("select[name=sorting");
    sortEle.innerHTML=cleanData(`<option value=''>Select Sorting</option>`);
    for(let option of SORT_OPTIONS){
        let optionEle = document.createElement("option");
        optionEle.value = `${option.value}`
        optionEle.innerText=`${option.title}`
        sortEle.appendChild(optionEle);
    }
}
/**
 * searchProduct function is used debounce the keyword search
 */
const searchProduct = ()=>{
    let timeOutId;
    if(timeOutId)
        clearTimeout(timeOutId);
    timeOutId=setTimeout(()=>{
        applyfilters()
    },1000);
}
/**
 * keywordSearch function is used to implement keyword search logic
 * @param {keyw} key 
 * @param {*} inputObj 
 */
const keywordSearch=(key,inputObj={arrangeItems:true})=>{
    products = products.filter((product)=>{
        let someResp=Object.values({title:product.title, price:product.price, category: product.category}).some(value =>{
            matchRes=value.toString().toLowerCase().includes(key.toLowerCase());
            if(matchRes) 
                return true; 
            else 
                return false;
        });
        return someResp;
    });
    console.log(products);
    if(inputObj.arrangeItems){
        arrangeItemsPerPage();
    }
}
/**
 * applyPriceFilter function is to apply price filters
 */
const applyPriceFilter=()=>{
    document.getElementById("price-error-message").innerText='';
    const min = parseInt(priceInputs[0].value);
    const max = parseInt(priceInputs[1].value);
    console.log(min, max)
    if(min < max){
        products = products.filter(product => product.price >= min && product.price <= max);
    }
    else{
        document.getElementById("price-error-message").innerText=ERRORS.PRICE_FILTER_ERROR;
    }
}

/**
 * loadmoreProducts is used to lazy load products
 * @param {*} e 
 */
function loadmoreProducts (e){
    e.preventDefault();
    let moreProducts=[];
    if(totalProducts + ITEMS_PER_PAGE < products.length ){
        moreProducts = products.slice(totalProducts, ITEMS_PER_PAGE);
    }
    else{
        moreProducts = products.slice(totalProducts, products.length);
    }
    buildProducts(moreProducts, false);
    showHideLoadMore(products,totalProducts+moreProducts.length);
}
/**
 * showHideLoadMore function is used to show/hide Load More text
 * @param {*} originalProducts 
 * @param {*} total 
 */
const showHideLoadMore = (originalProducts, total=totalProducts)=>{
    if(originalProducts.length <= total){
        loadMore.style.display='none'
    }
    else{
        loadMore.style.display="block"
    }
    setTotalProducts(total)
}
/**
 * setError is used to set the errors object
 * @param {*} errorObj 
 * @param {*} errKey 
 * @returns 
 */
const setError= (errorObj, errKey)=>{
    errorObj[errKey] = ERRORS[errKey];
    return errorObj;
}
/**
 * displayErrors function is used to bind the error messages to UI
 */
const displayErrors = ()=>{
    listWrapper.innerHTML="";
    let errorList = document.createElement("ul");
    errorList.setAttribute("aria-live","assertive");
    errorList.setAttribute("role","alert")  
    errorList.classList.add("errors-container");
    let errorListItems="";
    for(let [key,value] of Object.entries(products_errors)){
        console.log(key,value);
        errorListItems= errorListItems +`<li>${value}</li>`;
    }
    errorList.innerHTML=cleanData(errorListItems);
    listWrapper.appendChild(errorList);
}
const toggleMobileMenu = ()=>{
    mobileMenuContainer.classList.add("show")
}
const closeBtn = document.querySelector("#close-button");
closeBtn.addEventListener("click", () => {
    mobileMenuContainer.classList.toggle("show")
});

fetchProducts(); // invoking function for fetching products
bindSortOptions(); // invoking function for defining sort options
