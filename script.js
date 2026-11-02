const STORE_EMAIL = "sp8855681@gmail.com";
const ORDER_RECEIPT_MESSAGE = "Received, thank you for trusting our service.";
const ORDER_EMAIL_CONFIG = {
  publicKey: "",
  serviceId: "",
  orderTemplateId: "",
  receiptTemplateId: "",
};

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

document.querySelectorAll(".menu-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    document.getElementById(button.getAttribute("aria-controls")).classList.toggle("is-open", !expanded);
  });
});

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = document.querySelector("[data-form-note]");
    if (!STORE_EMAIL) {
      note.textContent = "The store’s email address hasn’t been set yet, so your message can’t be sent. Please add it in script.js before launch.";
      note.classList.add("form-note-error");
      return;
    }

    const formData = new FormData(contactForm);
    const subject = `Website enquiry from ${formData.get("name")}`;
    const body = [
      `Name: ${formData.get("name")}`,
      `Phone or email: ${formData.get("replyTo")}`,
      "",
      formData.get("message"),
    ].join("\n");
    window.location.href = `mailto:${STORE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Your email app is opening with your message ready to send.";
    note.classList.remove("form-note-error");
  });
}

const products = [
  { id: "peak-sachet", name: "Peak milk sachets", detail: "Sachets · quantity as needed", icon: "🥛", color: "card-cream" },
  { id: "peak-tin", name: "Peak milk tins", detail: "Tins · quantity as needed", icon: "🥛", color: "card-peach" },
  { id: "three-crowns", name: "Three Crowns milk", detail: "Ask us about available sizes", icon: "🥛", color: "card-blue" },
  { id: "nutri-milk", name: "Nutri Milk (big)", detail: "Large size · quantity as needed", icon: "🥛", color: "card-green" },
  { id: "other-milk", name: "Other Nutri Milk brands", detail: "Tell us your preferred brand in the notes", icon: "🥛", color: "card-cream" },
  { id: "golden-morn", name: "Golden Morn", detail: "Breakfast favourite", icon: "🥣", color: "card-peach" },
  { id: "bottled-water", name: "Bottled water", detail: "Quantity as needed", icon: "💧", color: "card-blue" },
  { id: "duju-yoghurt", name: "Duju yoghurt", detail: "Quantity as needed", icon: "🍶", color: "card-green" },
  { id: "fanta", name: "Fanta", detail: "Quantity as needed", icon: "🍊", color: "card-peach" },
  { id: "coke", name: "Coke", detail: "Quantity as needed", icon: "🥤", color: "card-cream" },
  { id: "sprite", name: "Sprite", detail: "Quantity as needed", icon: "🍋", color: "card-green" },
];

const productList = document.querySelector("[data-product-list]");
if (productList) {
  const cartKey = "sp-alheri-order-cart";
  const cartStatus = document.querySelector("[data-order-status]");
  let cart = {};

  try {
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart && typeof parsedCart === "object" && !Array.isArray(parsedCart)) {
        cart = Object.fromEntries(
          Object.entries(parsedCart).filter(([id, quantity]) =>
            products.some((product) => product.id === id) &&
            Number.isInteger(quantity) &&
            quantity > 0
          )
        );
      } else {
        throw new Error("Saved cart data is not a valid order.");
      }
    }
  } catch (error) {
    console.error("Could not restore the saved order.", error);
    cartStatus.textContent = "Your previous cart could not be restored. You can start a new order below.";
    cartStatus.classList.add("form-note-error");
    cart = {};
  }

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = `order-product ${product.color}`;
    card.innerHTML = `
      <div class="order-product-top"><span class="order-product-icon" aria-hidden="true">${product.icon}</span><span class="product-tag">Ask for current price</span></div>
      <h3>${product.name}</h3>
      <p>${product.detail}</p>
      <div class="add-product-row">
        <label class="visually-hidden" for="quantity-${product.id}">Quantity of ${product.name}</label>
        <input id="quantity-${product.id}" type="number" min="1" step="1" value="1" inputmode="numeric">
        <button class="button button-dark add-to-order" type="button" data-add-product="${product.id}">Add to order <span aria-hidden="true">+</span></button>
      </div>`;
    productList.append(card);
  });

  const countLabel = (count) => `${count} ${count === 1 ? "item" : "items"}`;
  const cartItems = document.querySelector("[data-cart-items]");
  const result = document.querySelector("[data-order-result]");
  const resultText = document.querySelector("[data-order-text]");

  function saveCart() {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch (error) {
      console.error("Could not save the order on this device.", error);
      cartStatus.textContent = "Your order is active, but this browser could not save it for later.";
      cartStatus.classList.add("form-note-error");
    }
  }

  function renderCart() {
    const total = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach((element) => {
      element.textContent = countLabel(total);
    });
    cartItems.replaceChildren();

    const selectedProducts = products.filter((product) => cart[product.id]);
    if (selectedProducts.length === 0) {
      const empty = document.createElement("p");
      empty.className = "cart-empty";
      empty.textContent = "Your list is empty for now. Add a few favourites to get started.";
      cartItems.append(empty);
      return;
    }

    selectedProducts.forEach((product) => {
      const row = document.createElement("div");
      row.className = "cart-line";
      row.innerHTML = `
        <div class="cart-line-info"><strong></strong><span>Price confirmed by the store</span></div>
        <div class="cart-line-controls">
          <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Remove one ${product.name}">−</button>
          <span>${cart[product.id]}</span>
          <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Add one ${product.name}">+</button>
          <button class="remove-item" type="button" data-cart-action="remove" data-product-id="${product.id}" aria-label="Remove ${product.name} from order">Remove</button>
        </div>`;
      row.querySelector(".cart-line-info strong").textContent = product.name;
      cartItems.append(row);
    });
  }

  productList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-product]");
    if (!button) return;
    const productId = button.dataset.addProduct;
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = Number(quantityInput.value);
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      quantityInput.setCustomValidity("Enter a whole number greater than zero.");
      quantityInput.reportValidity();
      return;
    }
    quantityInput.setCustomValidity("");
    cart[productId] = (cart[productId] || 0) + quantity;
    saveCart();
    renderCart();
    result.hidden = true;
    cartStatus.textContent = `${products.find((product) => product.id === productId).name} added to your order.`;
    cartStatus.classList.remove("form-note-error");
  });

  cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    const { productId, cartAction } = button.dataset;
    if (cartAction === "increase") cart[productId] += 1;
    if (cartAction === "decrease") {
      cart[productId] -= 1;
      if (cart[productId] <= 0) delete cart[productId];
    }
    if (cartAction === "remove") delete cart[productId];
    saveCart();
    renderCart();
    result.hidden = true;
  });

  const orderForm = document.querySelector("[data-order-form]");
  let isSendingOrder = false;
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedProducts = products.filter((product) => cart[product.id]);
    if (selectedProducts.length === 0) {
      cartStatus.textContent = "Add at least one product to your order before continuing.";
      cartStatus.classList.add("form-note-error");
      return;
    }

    const formData = new FormData(orderForm);
    const replyTo = String(formData.get("replyTo")).trim();
    const looksLikeEmail = replyTo.includes("@");
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo);
    if (looksLikeEmail && !validEmail) {
      cartStatus.textContent = "Enter a valid email address, or provide a phone number so the store can contact you.";
      cartStatus.classList.add("form-note-error");
      return;
    }

    const lines = [
      "SP Alheri Store order request",
      `Name: ${formData.get("name")}`,
      `Phone or email: ${replyTo}`,
      "",
      "Requested products:",
      ...selectedProducts.map((product) => `- ${product.name} x ${cart[product.id]}`),
      "",
      "Please confirm current availability and prices.",
      formData.get("notes") ? `Additional notes: ${formData.get("notes")}` : "",
    ].filter(Boolean);
    const body = lines.join("\n");
    resultText.textContent = body;
    result.hidden = false;

    const configReady = Object.values(ORDER_EMAIL_CONFIG).every((value) => value.trim());
    if (!configReady) {
      cartStatus.textContent = `Your order details are ready, but have NOT been sent. Configure the EmailJS public key, service ID, order template ID and receipt template ID in script.js. The order template must send to ${STORE_EMAIL}; the receipt template must send to {{reply_to_email}}.`;
      cartStatus.classList.add("form-note-error");
      return;
    }

    if (!window.emailjs || isSendingOrder) {
      cartStatus.textContent = isSendingOrder
        ? "Your order is being sent. Please wait."
        : "The order email service did not load. Check your connection and try again; your order has not been sent.";
      cartStatus.classList.add("form-note-error");
      return;
    }

    isSendingOrder = true;
    const submitButton = orderForm.querySelector("[type='submit']");
    submitButton.disabled = true;
    cartStatus.textContent = "Sending your order request...";
    cartStatus.classList.remove("form-note-error");

    const orderId = `SP-${Date.now()}`;
    const templateParams = {
      order_id: orderId,
      store_email: STORE_EMAIL,
      customer_name: String(formData.get("name")).trim(),
      reply_to: replyTo,
      reply_to_email: validEmail ? replyTo : "",
      order_details: body,
      receipt_message: ORDER_RECEIPT_MESSAGE,
      notes: String(formData.get("notes") || "").trim() || "No additional notes.",
    };

    window.emailjs.send(
      ORDER_EMAIL_CONFIG.serviceId,
      ORDER_EMAIL_CONFIG.orderTemplateId,
      templateParams,
      { publicKey: ORDER_EMAIL_CONFIG.publicKey },
    ).then(async () => {
      cart = {};
      saveCart();
      renderCart();
      orderForm.reset();
      if (!validEmail) {
        cartStatus.textContent = `Order ${orderId} was sent to the store. No email receipt was sent because you provided a phone number; the store can follow up using that number.`;
        cartStatus.classList.remove("form-note-error");
        return;
      }

      try {
        await window.emailjs.send(
          ORDER_EMAIL_CONFIG.serviceId,
          ORDER_EMAIL_CONFIG.receiptTemplateId,
          templateParams,
          { publicKey: ORDER_EMAIL_CONFIG.publicKey },
        );
        cartStatus.textContent = `Order ${orderId} was sent to the store, and a receipt was emailed to ${replyTo}. The store will follow up to confirm availability and prices.`;
        cartStatus.classList.remove("form-note-error");
      } catch (error) {
        console.error("The order reached the store, but the customer receipt could not be sent.", error);
        cartStatus.textContent = `Order ${orderId} reached the store, but we could not send the receipt to ${replyTo}. The store can still follow up using your contact details.`;
        cartStatus.classList.add("form-note-error");
      }
    }).catch((error) => {
      console.error("The order could not be sent to the store.", error);
      cartStatus.textContent = "We could not send your order. Your cart is still saved; check your connection and try again.";
      cartStatus.classList.add("form-note-error");
    }).finally(() => {
      isSendingOrder = false;
      submitButton.disabled = false;
    });
  });

  document.querySelector("[data-copy-order]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(resultText.textContent);
      cartStatus.textContent = "Order details copied. They have not been sent to the store.";
      cartStatus.classList.remove("form-note-error");
    } catch (error) {
      console.error("Could not copy the order details.", error);
      cartStatus.textContent = "Could not copy automatically. Select and copy the order details above.";
      cartStatus.classList.add("form-note-error");
    }
  });

  renderCart();
}
