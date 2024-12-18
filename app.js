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
const CURRENCY_SYMBOL= "$";
let products=[];
let masterProducts=[];
let totalProducts=0;
let products_errors={};
let categories=[];
let productsWrapper = document.querySelector(".list-wrapper");
let categoriesWrapper = document.querySelector("ul");
console.log(productsWrapper);
const fetchProducts = async ()=>{
    try{
        const data = await fetch(PRODUCTS_API);
        const response = await data.json();
        if(response && response.length){
            products = response;
            masterProducts = response;
            console.log(products);
            let list ='';
            for(let product of products){
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
            
            buildProducts();
        }
        else{
            products =[];
        }
    }
    catch(error){
        products_errors=setError(products_errors,'API_ERROR');
    }
}
function applyfilters(){
    // const formData = new FormData(filterform);
    // const formProps = Object.fromEntries(formData);
    let categoriesEle=Array.from(document.getElementsByName('category'));
    categories= categoriesEle.filter(el=>el.checked).map(el=>el.value);
    products = masterProducts.filter(product => categories.includes(product.category))
    buildProducts(products);

}
function applySorting(){
    sortOption = document.querySelector('select[name=sorting]');
    switch(sortOption.value){
        case 'price-l-h':
            products = masterProducts.sort((a,b)=> a.price - b.price);
        break;
        case 'price-h-l':
            products = masterProducts.sort((a,b)=> b.price - a.price);
        break;
        case 'a-z':
            products = masterProducts.sort((a,b)=>{
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
            products = masterProducts.sort((a,b)=>{
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
    buildProducts(products);
}
const buildProducts = (products=masterProducts)=>{
    productsWrapper.innerText='';
    for(let product of products){
        const listDiv=document.createElement("div");
        listDiv.classList.add('list-item');
        listDiv.innerHTML=`
        <div class="product-image-container">
            <img src="${product.image}" class="product-image">
        </div>
        <div>
            ${product.title}
        </div>
        <div>
           ${CURRENCY_SYMBOL+product.price} 
        </div>`;
        console.log(listDiv);
        productsWrapper.appendChild(listDiv);
    }
    setTotalProducts(products.length)
}
const setTotalProducts=(totalProducts)=>{
    document.getElementById('total').innerText =`${totalProducts} results`;
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
    const searchKeyword = document.getElementById("search");
    console.log(searchKeyword.value);
    let timeOutId;
    if(timeOutId)
        clearTimeout(timeOutId);
    timeOutId=setTimeout(()=>{
        keywordSearch(searchKeyword.value)
    },1000);
}
const keywordSearch=(key)=>{
    products = masterProducts.filter((product)=>{
        let someResp=Object.values(product).some(value =>{
            matchRes=value.toString().toLowerCase().includes(key.toLowerCase());
            if(matchRes) 
                return true; 
            else 
                return false;
        });
        return someResp;
    });
    console.log(products);
    buildProducts(products);
}
const setError= (errorObj, errKey)=>{
    errorObj[errKey] = ERRORS[errKey];
    return errorObj;
}
fetchProducts();
bindSortOptions();
