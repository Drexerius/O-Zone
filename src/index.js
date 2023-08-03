// get data from json
async function getData() {
    try {
        const response = await fetch('db/goods.json');
        if (!response.ok) {
        throw new Error('Fetch request failed');
    }
    const data = await response.json();
    return data;
} catch (error) {
    console.error(error);
    throw error;
}
}

async function script() {
    const categories = {
        "Gaming consoles": 'cat-cons',
        "PC accessories": 'cat-accs',
        "Games and software": 'cat-soft',
    }

    let filter = {
        category: 'clear',
        search: '',
        price: [0, 0],
        sale: false
    };
    
    let goods = (await getData()).goods;

    // create divs for items
    function showItems() {
        goods.forEach(el => {
            document.querySelector('.goods').insertAdjacentHTML("beforeend", `
            <div class="item-card ${categories[el.category]}">
            ${el.sale ? `<div class="item-sale">&#128293;Hot sales!</div>` : ``}
            <div class="item-img">
            <img src="${el.img}"></img>
            </div>
            <div class="info-wrapper">
            <h4 class="item-price">${el.price} &#8381;</h4>
            <h5 class="item-title">${el.title}</h5>
                    <button class="add-item">Add to cart</button>
                    <button class="remove-item">Remove from cart</button>
                    </div>
                    </div>
                    `);
                })
                document.querySelector('.goods').insertAdjacentHTML("beforeend", `<div class="not-found">No results for you request</div>`)
    }            
    showItems();

    let items = document.querySelectorAll('.item-card');

    // reload item list with filters
    function reShow() { 
        let found = false;
        for (let i = 0; i < items.length; i++) {
            if (
                (filter.category == 'clear' || items[i].classList.value.includes(categories[filter.category]))
                && (items[i].querySelector('.item-title').textContent.toLowerCase().includes(filter.search.toLowerCase()))
                && (Number(items[i].querySelector('.item-price').textContent.slice(0, -2)) >= filter.price[0])
                && (Number(items[i].querySelector('.item-price').textContent.slice(0, -2)) <= filter.price[1] || filter.price[1] == 0)
                && ((filter.sale && items[i].querySelectorAll('.item-sale').length > 0) || (filter.sale == false))
            ) {
                items[i].style.display='flex';
                found = true;
            } else {
                items[i].style.display='none';
            }
        }
        document.querySelector('.not-found').style.display = found ? 'none' : 'flex';
    }

    // open/close catalog
    document.querySelector('.catalog-button').addEventListener('click', function() {
        document.querySelector('.shade').style.display='block';
        document.querySelector('.catalog').style.display='flex';
    })

    document.querySelectorAll('.catalog > button, .shade').forEach(el => { 
        el.addEventListener('click', function() {
            document.querySelector('.shade').style.display='none';
            document.querySelector('.catalog').style.display='none';
        }); 
    })

    //catalog buttons
    document.querySelector('.btn-clear').addEventListener('click', function() {
        filter.category = 'clear';
        reShow();
    })

    document.querySelector('.btn-cons').addEventListener('click', function() {
        filter.category = 'Gaming consoles';
        reShow();
    })

    document.querySelector('.btn-accs').addEventListener('click', function() {
        filter.category = 'PC accessories';
        reShow();
    })

    document.querySelector('.btn-soft').addEventListener('click', function() {
        filter.category = 'Games and software';
        reShow();
    })

    document.querySelector('.filters button').addEventListener('click', function() {
        let height = document.querySelector('.filters').offsetHeight;
        if (height == '33') {
            document.querySelector('.filters').style.height = '300px'
            document.querySelector('.arrow-down').style.display = 'block'        
            document.querySelector('.arrow-right').style.display = 'none'
        } else {
            document.querySelector('.filters').style.height = '33px'
            document.querySelector('.arrow-down').style.display = 'none'        
            document.querySelector('.arrow-right').style.display = 'block'        
        }
    })

    //search button
    document.querySelector('.search-button').addEventListener('click', function() {
        filter.search = document.querySelector('.search').value;
        reShow();
    })

    //searchbar on enter
    document.querySelector('.search').addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.querySelector('.search-button').click();
        }
    })

    //min price on enter
    document.querySelector('.filter-price input#min').addEventListener('keypress', function(event) {
        if (event.key === "Enter") {
            filter.price[0] = document.querySelector('.filter-price input#min').value;
            reShow();
        }
    })

    //max price on enter
    document.querySelector('.filter-price input#max').addEventListener('keypress', function(event) {
        if (event.key === "Enter") {
            filter.price[1] = Number(document.querySelector('.filter-price input#max').value);
            reShow();
        }
    })

    //apply filters
    document.querySelector('.apply-button').addEventListener('click', function() {
        filter.price[0] = Number(document.querySelector('.filter-price input#min').value);
        filter.price[1] = Number(document.querySelector('.filter-price input#max').value);
        filter.sale = document.querySelector('.filter-sale input').checked;
        reShow();
    })

    //clear filters
    document.querySelector('.clear-button').addEventListener('click', function() {
        document.querySelector('.filter-price input#min').value = null;
        document.querySelector('.filter-price input#max').value = null;
        document.querySelector('.filter-sale input').checked = false;
        document.querySelector('.apply-button').click();
    })

    //cart
    document.querySelector('.cart-button').addEventListener('click', function() {
        document.querySelector('.cart').style.display = 'flex';
    })

    document.querySelector('.cart-close').addEventListener('click', function() {
        document.querySelector('.cart').style.display = 'none';
    })

    let cart = [];
    let total_price = 0;
    let items_amount = 0;

    //add to cart
    items.forEach(el => {
        el.querySelector('.add-item').addEventListener('click', function() {
            //add clone
            let clone = el.cloneNode(true);
            cart.push(clone);
            items_amount++;
            clone.classList.add('cart-card');

            //add amount regulation
            clone.innerHTML += `<div class="item-amount">
                <input type="number" value="1" min="0" class="amount-input"> 
                <img src="img/minus.png" alt="minus" class="amount-minus">
                <img src="img/plus.png" alt="plus" class="amount-plus">
            </div>`
            clone.setAttribute('amount', 1);
            function updateAmount() {
                if (clone.querySelector('.amount-input').value == 0) {
                    removeItem(clone, el);
                } else {
                    let amount_diff = (clone.querySelector('.amount-input').value - clone.getAttribute('amount'));
                    total_price += Number(clone.querySelector('.item-price').textContent.slice(0, -2)) * amount_diff;
                    items_amount += amount_diff;
                }
                clone.setAttribute('amount', clone.querySelector('.amount-input').value);
                updateCart();
            }
            clone.querySelector('.amount-input').addEventListener('change', updateAmount)
            clone.querySelector('.amount-minus').addEventListener('click', function () {
                clone.querySelector('.amount-input').value--;
                updateAmount();
            })
            clone.querySelector('.amount-plus').addEventListener('click', function () {
                clone.querySelector('.amount-input').value++;
                updateAmount();
            })

            //remove button
            clone.querySelector('.add-item').style.display='none';
            clone.querySelector('.remove-item').style.display='none';
            clone.querySelector('.remove-item').addEventListener('click', function() {
                removeItem(clone, el);
            });
            total_price += Number(clone.querySelector('.item-price').textContent.slice(0, -2));
            updateCart();

            el.querySelector('.add-item').style.display='none';
            el.querySelector('.remove-item').style.display='flex';
            el.querySelector('.remove-item').addEventListener('click', function() {
                removeItem(clone, el);
            });
        })
    })

    //reload cart items
    function updateCart() {
        document.querySelector('.cart-empty').style.display = cart.length ? 'none' : 'flex';
        for (let i = 0; i < cart.length; i++) {
            document.querySelector('.cart-items').append(cart[i]);
            
        }
        document.querySelector('.cart-total').textContent = "Total price: " + total_price;
        document.querySelector('.counter').textContent = items_amount;
        document.querySelector('.counter').style.display = items_amount ? 'flex' : 'none';
    }

    //remove from cart
    function removeItem(clone, element) {
        cart.splice(cart.indexOf(clone), 1);
        total_price -= clone.getAttribute('amount') * Number(clone.querySelector('.item-price').textContent.slice(0, -2));
        items_amount -= clone.getAttribute('amount');
        clone.setAttribute('amount', 0);
        clone.remove();
        updateCart();
        element.querySelector('.goods .add-item').style.display='flex';
        element.querySelector('.goods .remove-item').style.display='none';
    }

}
script();