document.addEventListener('DOMContentLoaded', () => {
    // For demo, show the login modal on page load (you can add logic to check if the user is already logged in)
    document.getElementById('loginModal').style.display = 'block';
  
    // Close modal when the close button is clicked
    document.getElementById('closeLogin').addEventListener('click', () => {
      document.getElementById('loginModal').style.display = 'none';
    });
    document.getElementById('closeRegister').addEventListener('click', () => {
      document.getElementById('registerModal').style.display = 'none';
    });
  
    // Switch from login to register
    document.getElementById('showRegister').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('loginModal').style.display = 'none';
      document.getElementById('registerModal').style.display = 'block';
    });
  
    // Switch from register to login
    document.getElementById('showLogin').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('registerModal').style.display = 'none';
      document.getElementById('loginModal').style.display = 'block';
    });
  
    // Close modal if clicking outside the modal content
    window.addEventListener('click', (event) => {
      const loginModal = document.getElementById('loginModal');
      const registerModal = document.getElementById('registerModal');
      if (event.target == loginModal) {
        loginModal.style.display = 'none';
      }
      if (event.target == registerModal) {
        registerModal.style.display = 'none';
      }
    });
  
    // Handle login form submission
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorElement = document.getElementById('loginError');

      try {
        const response = await fetch('electromart-backend/auth/login.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
          // Store JWT token in localStorage
          localStorage.setItem('authToken', data.token);
          
          // Redirect to home page
          window.location.href = 'index.html';
        } else {
          // Display error message
          errorElement.textContent = data.error || 'Login failed';
        }
      } catch (error) {
        errorElement.textContent = 'Network error. Please try again.';
        console.error('Login error:', error);
      }
    });
  
    // Handle register form submission
    document.getElementById('registerForm').addEventListener('submit', function(e) {
      e.preventDefault();
      // Here you would add your registration logic (e.g., call an API)
      alert("Registration successful!");
      document.getElementById('registerModal').style.display = 'none';
    });
  });
  

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Update the cart count in the nav (works on all pages)
    updateCartCount();
  
    // If we are on the products page, attach event listeners to Add to Cart buttons
    const addCartButtons = document.querySelectorAll(".product-item button");
    if (addCartButtons) {
      addCartButtons.forEach(button => {
        button.addEventListener("click", addToCart);
      });
    }
  
    // If we are on the cart page, build the cart table from localStorage data
    if (document.querySelector(".cart-page")) {
      buildCartPage();
    }
  });
  
  // Helper: Get cart from localStorage or return empty array
  function getCart() {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  }
  
  // Helper: Save cart to localStorage
  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  
  // Update the cart count in the nav
  function updateCartCount() {
    const cart = getCart();
    const countElem = document.getElementById("cart-count");
    if (countElem) {
      countElem.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
  }
  
  // Add product to cart function
  function addToCart(event) {
    // Find the product item container
    const productElem = event.target.closest(".product-item");
    if (!productElem) return;
  
    // Get product details from DOM
    const image = productElem.querySelector("img").src;
    const title = productElem.querySelector("h3").textContent;
    const priceText = productElem.querySelector(".price").textContent;
    const price = parseFloat(priceText.replace("$", ""));
    
    // Create a product object
    const product = {
      id: title, // use title as a simple unique identifier; in real apps use a proper product id
      image,
      title,
      price,
      quantity: 1
    };
  
    // Retrieve existing cart items
    let cart = getCart();
  
    // Check if product already exists; if so, increase quantity
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(product);
    }
    
    // Save cart to localStorage and update count
    saveCart(cart);
    updateCartCount();
    
    // Redirect to cart page (or you can simply show a notification)
    window.location.href = "cart.html";
  }
  
  // Build Cart Page: Populate table with items and calculate totals
  function buildCartPage() {
    const cart = getCart();
    const tbody = document.querySelector(".cart-table tbody");
    const summaryElem = document.querySelector(".cart-summary");
    let subtotal = 0;
    
    // Clear existing rows (if any)
    tbody.innerHTML = "";
    
    cart.forEach((item, index) => {
      const totalItem = item.price * item.quantity;
      subtotal += totalItem;
      
      // Create table row
      const row = document.createElement("tr");
      row.classList.add("cart-item");
      row.innerHTML = `
        <td><img src="${item.image}" alt="${item.title}"></td>
        <td>${item.title}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td><input type="number" value="${item.quantity}" min="1" data-index="${index}"></td>
        <td>$${totalItem.toFixed(2)}</td>
        <td><button class="remove-btn" data-index="${index}">X</button></td>
      `;
      tbody.appendChild(row);
    });
    
    // Calculate shipping as a flat rate (example: $50 if subtotal > 0)
    const shipping = cart.length > 0 ? 50 : 0;
    const total = subtotal + shipping;
    
    // Update summary
    summaryElem.innerHTML = `
      <h2>Cart Summary</h2>
      <p>Subtotal: <span>$${subtotal.toFixed(2)}</span></p>
      <p>Shipping: <span>$${shipping.toFixed(2)}</span></p>
      <p>Total: <span>$${total.toFixed(2)}</span></p>
      <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
    `;
    
    // Attach event listeners for quantity changes and removal
    const qtyInputs = document.querySelectorAll(".cart-table input[type='number']");
    qtyInputs.forEach(input => {
      input.addEventListener("change", updateQuantity);
    });
    
    const removeButtons = document.querySelectorAll(".remove-btn");
    removeButtons.forEach(button => {
      button.addEventListener("click", removeItem);
    });
  }
  
  // Update quantity when input changes
  function updateQuantity(event) {
    const input = event.target;
    const index = input.getAttribute("data-index");
    let cart = getCart();
    const newQty = parseInt(input.value);
    if (newQty < 1) {
      input.value = 1;
      return;
    }
    cart[index].quantity = newQty;
    saveCart(cart);
    updateCartCount();
    buildCartPage(); // rebuild the cart page to update totals
  }
  
  // Remove item from cart
  function removeItem(event) {
    const index = event.target.getAttribute("data-index");
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartCount();
    buildCartPage();
  }
  
  // Placeholder for checkout functionality
  function checkout() {
    alert("Proceeding to checkout...");
    // Here you would typically redirect to a checkout page or start the payment process.
  }
  
  // Build the Checkout Page by displaying order summary based on the cart
function buildCheckoutPage() {
    const cart = getCart(); // reuse the getCart() function from previous code
    const orderItemsContainer = document.getElementById("orderItems");
    let subtotal = 0;
  
    orderItemsContainer.innerHTML = "";
    cart.forEach(item => {
      const totalItem = item.price * item.quantity;
      subtotal += totalItem;
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");
      itemDiv.innerHTML = `
        <span>${item.title} x ${item.quantity}</span>
        <span>$${totalItem.toFixed(2)}</span>
      `;
      orderItemsContainer.appendChild(itemDiv);
    });
    
    // Example flat rate shipping
    const shipping = cart.length > 0 ? 50 : 0;
    const total = subtotal + shipping;
    
    // Update summary totals
    document.getElementById("summarySubtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("summaryShipping").textContent = `$${shipping.toFixed(2)}`;
    document.getElementById("summaryTotal").textContent = `$${total.toFixed(2)}`;
  }
  
  // Event listener for the customer details form submission
  document.addEventListener("DOMContentLoaded", () => {
    // Update cart count on all pages
    updateCartCount();
  
    // Check if we're on the checkout page
    if (document.querySelector(".checkout-page")) {
      buildCheckoutPage();
      const customerForm = document.getElementById("customerForm");
      customerForm.addEventListener("submit", function(e) {
        e.preventDefault();
        // Retrieve customer details
        const name = document.getElementById("customerName").value;
        const email = document.getElementById("customerEmail").value;
        const phone = document.getElementById("customerPhone").value;
        const address = document.getElementById("customerAddress").value;
        
        // For this demo, we'll simply display an alert. In a real app, you'd send these details to your server.
        alert(`Order confirmed!\nCustomer: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nThank you for your purchase!`);
        
        // Optionally clear the cart after confirmation
        localStorage.removeItem("cart");
        updateCartCount();
        // Redirect to a thank you page or home page
        window.location.href = "index.html";
      });
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    initCarousel();
    initLiveSearch();
  
    // Attach event listeners for Add to Cart and Buy Now buttons
    const addCartButtons = document.querySelectorAll(".add-cart-btn");
    addCartButtons.forEach(button => {
      button.addEventListener("click", addToCart);
    });
    const buyNowButtons = document.querySelectorAll(".buy-now-btn");
    buyNowButtons.forEach(button => {
      button.addEventListener("click", buyNow);
    });
  
    // Open product modal when clicking on a product (excluding buttons)
    const productItems = document.querySelectorAll(".product-item");
    productItems.forEach(item => {
      item.addEventListener("click", event => {
        if (
          !event.target.classList.contains("add-cart-btn") &&
          !event.target.classList.contains("buy-now-btn")
        ) {
          openProductModal(item);
        }
      });
    });
  
    // Modal close event
    const modalClose = document.querySelector(".modal .close");
    modalClose.addEventListener("click", closeProductModal);
    window.addEventListener("click", event => {
      const modal = document.getElementById("productModal");
      if (event.target == modal) {
        closeProductModal();
      }
    });
  
    // Comment posting in modal
    document.getElementById("postComment").addEventListener("click", postComment);
  });
  
  // ---------- Carousel Functions ----------
  let slideIndex = 0;
  function initCarousel() {
    showSlide(slideIndex);
    document.querySelector(".carousel-btn.prev").addEventListener("click", () => {
      slideIndex = (slideIndex - 1 + getSlideCount()) % getSlideCount();
      showSlide(slideIndex);
    });
    document.querySelector(".carousel-btn.next").addEventListener("click", () => {
      slideIndex = (slideIndex + 1) % getSlideCount();
      showSlide(slideIndex);
    });
    // Auto-slide every 5 seconds
    setInterval(() => {
      slideIndex = (slideIndex + 1) % getSlideCount();
      showSlide(slideIndex);
    }, 5000);
  }
  
  function getSlideCount() {
    return document.querySelectorAll(".carousel-slide").length;
  }
  
  function showSlide(index) {
    const carouselContainer = document.querySelector(".carousel-container");
    carouselContainer.style.transform = `translateX(-${index * 100}%)`;
  }
  
  // ---------- Live Search Function ----------
  function initLiveSearch() {
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("keyup", () => {
      const filter = searchInput.value.toLowerCase();
      const products = document.querySelectorAll(".product-item");
      products.forEach(product => {
        const title = product.getAttribute("data-title").toLowerCase();
        if (title.includes(filter)) {
          product.style.display = "block";
        } else {
          product.style.display = "none";
        }
      });
    });
  }
  
  // ---------- Cart Functions ----------
  function getCart() {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  }
  
  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  
  function updateCartCount() {
    const cart = getCart();
    const countElem = document.getElementById("cart-count");
    if (countElem) {
      countElem.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
  }
  
  function addToCart(event) {
    event.stopPropagation();
    const productElem = event.target.closest(".product-item");
    if (!productElem) return;
    const image = productElem.querySelector("img").src;
    const title = productElem.querySelector("h3").textContent;
    const priceText = productElem.querySelector(".price").textContent;
    const price = parseFloat(priceText.replace("$", ""));
    const product = {
      id: title,
      image,
      title,
      price,
      quantity: 1
    };
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(product);
    }
    saveCart(cart);
    updateCartCount();
    alert(`${title} added to cart.`);
  }
  
  function buyNow(event) {
    event.stopPropagation();
    addToCart(event);
    setTimeout(() => {
      window.location.href = "checkout.html";
    }, 300);
  }
  
  // ---------- Product Modal Functions ----------
  function openProductModal(productElem) {
    const modal = document.getElementById("productModal");
    document.getElementById("modalImage").src = productElem.querySelector("img").src;
    document.getElementById("modalTitle").textContent = productElem.querySelector("h3").textContent;
    // Use the short description plus additional text for detailed description
    const shortDesc = productElem.querySelector(".short-desc") ? productElem.querySelector(".short-desc").textContent : "";
    document.getElementById("modalDescription").textContent = shortDesc + " This is a detailed description of the product with more features and specifications.";
    document.getElementById("modalPrice").textContent = productElem.querySelector(".price").textContent;
    document.getElementById("modalReviews").textContent = productElem.querySelector(".reviews").textContent;
    document.getElementById("commentsContainer").innerHTML = "";
    modal.style.display = "block";
  }
  
  function closeProductModal() {
    document.getElementById("productModal").style.display = "none";
  }
  
  // ---------- Comment Function ----------
  function postComment() {
    const commentText = document.getElementById("commentText").value;
    if (!commentText.trim()) return;
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");
    commentDiv.textContent = commentText;
    document.getElementById("commentsContainer").appendChild(commentDiv);
    document.getElementById("commentText").value = "";
  }
  document.addEventListener("DOMContentLoaded", () => {
    // Chatbot: Toggle open/close functionality
    const chatbot = document.getElementById("chatbot");
    const chatbotToggle = document.getElementById("chatbotToggle");
    chatbotToggle.addEventListener("click", () => {
      // Toggle the visibility of the chat input area and messages
      if (chatbot.style.height && chatbot.style.height !== "auto") {
        chatbot.style.height = "40px"; // only show header
      } else {
        chatbot.style.height = "350px"; // expanded view
      }
    });
  
    // Chatbot: Sending messages
    const chatbotInput = document.getElementById("chatbotInput");
    const chatbotSend = document.getElementById("chatbotSend");
    const chatbotMessages = document.getElementById("chatbotMessages");
  
    chatbotSend.addEventListener("click", sendChatMessage);
    chatbotInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendChatMessage();
    });
  
    function sendChatMessage() {
      const messageText = chatbotInput.value.trim();
      if (!messageText) return;
      
      appendMessage("You", messageText);
      chatbotInput.value = "";
      
      // Simulated response after 1 second
      setTimeout(() => {
        appendMessage("Support", "Thank you for your message. How can we help you?");
      }, 1000);
    }
  
    function appendMessage(sender, text) {
      const messageDiv = document.createElement("div");
      messageDiv.style.marginBottom = "8px";
      messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
      chatbotMessages.appendChild(messageDiv);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
  });


  function openProductModal(productElem) {
    const modal = document.getElementById("productModal");
    const imageSrc = productElem.querySelector("img").src;
    const titleText = productElem.querySelector("h3").textContent;
    const shortDesc = productElem.querySelector(".short-desc") ? productElem.querySelector(".short-desc").textContent : "";
    
    document.getElementById("modalImage").src = imageSrc;
    document.getElementById("modalTitle").textContent = titleText;
    document.getElementById("modalDescription").textContent = shortDesc + " This is a detailed description of the product with more features and specifications.";
    document.getElementById("modalPrice").textContent = productElem.querySelector(".price").textContent;
    document.getElementById("modalReviews").textContent = productElem.querySelector(".reviews").textContent;
    document.getElementById("commentsContainer").innerHTML = "";
    
    // Update social share URLs using current page URL and product title (customize as needed)
    const currentUrl = encodeURIComponent(window.location.href);
    const productTitle = encodeURIComponent(titleText);
    
    document.getElementById("shareFacebook").href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${productTitle}`;
    document.getElementById("shareTwitter").href = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${productTitle}`;
    document.getElementById("shareLinkedIn").href = `https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${productTitle}`;
    
    modal.style.display = "block";
  }

  fetch('http://localhost/electro_mart_backend/api/products.php')

  
  