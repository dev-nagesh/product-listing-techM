const PRODUCTS_API = "https://fakestoreapi.com/products";
const ERRORS = {
    NO_DATA: "No Data found",
    API_ERROR: "Something went wrong. Please try again.!"
}
const SORT_OPTIONS=[
    {value:"price-l-h", title:"Price: Low to High"},
    {value:"price-h-l", title:"Price: High to Low"},
    {value:"a-z", title:"A-Z"},
    {value:"z-a", title:"Z-A"}
]
const ITEMS_PER_PAGE = 10;
const CURRENCY_SYMBOL= "$";
let masterProducts=[];
let products=[];
let totalProducts=0;
let products_errors={};
let categories=[];
let productsWrapper = document.querySelector(".list-wrapper");
let categoriesWrapper = document.querySelector(".categories ul");
let loadMore = document.getElementById("load-more");
let totalResults = document.getElementById('total');
console.log(productsWrapper);
const listWrapper=document.querySelector('.list-wrapper');
const listItem = document.querySelector(".list-item");
console.log(listWrapper,listItem);
for(i=0; i<10; i++){
    listWrapper.append(listItem.cloneNode(true));
}
// let query = window.matchMedia("(min-width: 480px)");
// if(query.matches){
//     alert("Match")
// }

const fetchProducts = async ()=>{
    try{
        const data = await fetch(PRODUCTS_API);
        const response = await data.json();
        if(response && response.length){
            masterProducts = response;
            products = response;
            arrangeItemsPerPage();
            console.log(products);
            let list ='';
            buildCategories();

        }
        else{
            products =[];
            masterProducts =[];
        }
    }
    catch(error){
        products_errors=setError(products_errors,'API_ERROR');
        products =[];
        masterProducts =[];
    }
}
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
const buildProducts = (products=masterProducts, clearWrapper=true)=>{
    if(clearWrapper){
        productsWrapper.innerText='';
    }
    for(let product of products){
        const listDiv=document.createElement("div");
        listDiv.classList.add('list-item');
        listDiv.innerHTML=`
        <div class="product-image-container">
            <img src="${product.image}" class="product-image">
        </div>
        <div class="product-info">
            <div class="product-title">
                ${product.title}
            </div>
            <div class="product-price">
                ${CURRENCY_SYMBOL+product.price} 
            </div>
            <div class="favourite-wrapper">
                <img src="./favourite.svg" />
            </div>
        </div>`;
        console.log(listDiv);
        productsWrapper.appendChild(listDiv);
    }
}
const buildCategories = ()=>{
    categoriesWrapper.innerHTML="";
    for(let product of masterProducts){
        // Categories.
        categoryIndex=categories.findIndex(category => product.category == category);
        console.log(categoryIndex);
        if(categoryIndex == -1){
            categories.push(product.category);
            const categoryLi = document.createElement("li");
            categoryLi.innerHTML=`
            <input type="checkbox" value="${product.category}" name="category" onChange="applyfilters()"> ${product.category} 
            `;
            categoriesWrapper.appendChild(categoryLi)
        }
    }
}
function toggleFilters(){
    // let query = window.matchMedia("(min-width: 480px)");
    // if(query.matches){
        let categories = document.getElementById("categories");
        //categories.style.display='none';
        if(!categories.style.display || categories.style.display == 'none'){
            categories.style.display='block';
        }
        else{
            categories.style.display='none';
        }
    // }
    console.log(categories.style.display);
}
const setTotalProducts=(total)=>{
    totalResults.innerText =`${total} of ${products.length} results`;
    totalProducts = total;
}
const bindSortOptions = ()=>{
    sortEle = document.querySelector("select[name=sorting");
    sortEle.innerHTML=`<option value=''>Select Sorting</option>`
    for(option of SORT_OPTIONS){
        optionEle = document.createElement("option");
        optionEle.value = `${option.value}`
        optionEle.innerText=`${option.title}`
        sortEle.appendChild(optionEle);
    }
}
const searchProduct = ()=>{
    let timeOutId;
    if(timeOutId)
        clearTimeout(timeOutId);
    timeOutId=setTimeout(()=>{
        applyfilters()
    },1000);
}
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
const showHideLoadMore = (originalProducts, total=totalProducts)=>{
    if(originalProducts.length <= total){
        loadMore.style.display='none'
    }
    else{
        loadMore.style.display="block"
    }
    setTotalProducts(total)
}
const setError= (errorObj, errKey)=>{
    errorObj[errKey] = ERRORS[errKey];
    return errorObj;
}
fetchProducts();
bindSortOptions();
