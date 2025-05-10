const TUTORIALS = [
  {
    id: 1,
    name: "How to Create an Account",
    url: "https://www.youtube.com/embed/kUMe1FH4CHE",
  },
  {
    id: 2,
    name: "How to Browse and Search Shoes",
    url: "https://www.youtube.com/embed/kUMe1FH4CHE",
  },
  {
    id: 3,
    name: "How to Place an Order",
    url: "https://www.youtube.com/embed/kUMe1FH4CHE",
  },
  {
    id: 4,
    name: "How to Track Your Order",
    url: "https://www.youtube.com/embed/kUMe1FH4CHE",
  },
  {
    id: 5,
    name: "How to Make a Payment",
    url: "https://www.youtube.com/embed/kUMe1FH4CHE",
  },
  {
    id: 6,
    name: "How to Request a Return or Refund",
    url: "https://www.youtube.com/embed/kUMe1FH4CHE",
  },
];

const FAQs = [
  {
    id: 1,
    title: "What is your return policy?",
    answer:
      "We accept returns within 30 days of purchase. Shoes must be unworn and in original packaging.",
  },
  {
    id: 2,
    title: "How long does delivery take?",
    answer:
      "Delivery usually takes 3–7 business days, depending on your location.",
  },
  {
    id: 3,
    title: "Do you offer free shipping?",
    answer: "Yes, we offer free standard shipping on orders over $50.",
  },
  {
    id: 4,
    title: "How can I track my order?",
    answer:
      "Once your order is shipped, you’ll receive a tracking link via email or SMS.",
  },
  {
    id: 5,
    title: "What payment methods do you accept?",
    answer: "We accept credit/debit cards, PayPal, and major digital wallets.",
  },
  {
    id: 6,
    title: "Can I change my order after placing it?",
    answer:
      "You can change or cancel your order within 1 hour of placing it by contacting our support team.",
  },
  {
    id: 7,
    title: "How do I know my shoe size?",
    answer:
      "Use our size guide available on every product page to find the perfect fit.",
  },
  {
    id: 8,
    title: "Do you restock sold-out items?",
    answer:
      "We restock popular items regularly. You can sign up for restock alerts on the product page.",
  },
  {
    id: 9,
    title: "Is it safe to shop on your website?",
    answer:
      "Yes, we use industry-standard encryption and secure payment gateways to protect your data.",
  },
  {
    id: 10,
    title: "How do I contact customer support?",
    answer:
      "You can reach us via email at support@solehaven.com or through our live chat during business hours.",
  },
];

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded");

  /* FAQ Section */
  const faqList = document.querySelector(".articles-box");
  const maxIndex = FAQs.length;
  const searchForm = document.querySelector(".support-search-form");
  const searchInput = searchForm.querySelector("input[type='search']");

  const generateFAQHTML = (item) => {
    return `
    <div class="article">
      <h4>${item.title}</h4>
      <p>${item.answer}</p>
      ${item.id !== maxIndex ? '<div class="line"></div>' : ""}
    </div>
  `;
  };

  const renderFAQs = (data) => {
    faqList.innerHTML = data.map((faq) => generateFAQHTML(faq)).join("");
  };

  // Initial rendering
  renderFAQs(FAQs);

  /* Support Video Tutorials */
  const videoList = document.querySelector(".video-grid-container");

  const generateVideoHTML = (item) => {
    return `
        <div class="grid-item" ${
          item.id === 1 ? 'id="first-support-video"' : ""
        }>
          <div class="video-card">
          <h4>${item.name}</h4>
            <iframe
              width="560"
              height="315"
              src="${item.url}"
              title="${item.name}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            >
            </iframe>
          </div>
        </div>
    `;
  };

  videoList.innerHTML = TUTORIALS.map((item) => generateVideoHTML(item)).join(
    ""
  );

  /* Navigations */
  const gettingStartedCard = document.getElementById("support-get-started");
  if (gettingStartedCard) {
    gettingStartedCard.addEventListener("click", () => {
      const target = document.getElementById("first-support-video");
      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const offset =
          rect.top + scrollTop - window.innerHeight / 2 + rect.height / 2;

        window.scrollTo({
          top: offset,
          behavior: "smooth",
        });
      }
    });
  }

  const videoTutorialCard = document.getElementById("support-video-tutorials");
  if (videoTutorialCard) {
    videoTutorialCard.addEventListener("click", () => {
      const target = document.querySelector(".support-video-section h2");
      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const offset =
          rect.top + scrollTop - window.innerHeight / 2 + rect.height / 2;

        window.scrollTo({
          top: offset,
          behavior: "smooth",
        });
      }
    });
  }

  const navigateToFAQ = () => {
    const target = document.querySelector(".support-faq-section h2");
    if (target) {
      const rect = target.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const offset =
        rect.top + scrollTop - window.innerHeight / 2 + rect.height / 2;

      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    }
  };

  const faqCard = document.getElementById("support-faqs");
  if (faqCard) {
    faqCard.addEventListener("click", () => {
      navigateToFAQ();
    });
  }

  /* Searching */
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const query = searchInput.value.trim().toLowerCase();
    const keyWords = query.split(/\W+/).filter((key) => key.length > 0);
    //console.log("Searching:", keyWords);

    if (keyWords.length === 0) {
      return;
    }

    const filteredFAQs = FAQs.filter((faq) =>
      keyWords.some(
        (word) =>
          faq.title.toLowerCase().includes(word) ||
          faq.answer.toLowerCase().includes(word)
      )
    );

    renderFAQs(filteredFAQs);
    navigateToFAQ();
  });

  /* Live Chat Section */
  const chatBtn = document.querySelector(".chat-button");

  chatBtn.addEventListener("click", () => {
    const chatBody = document.getElementById("chat-body");
    chatBody.style.display =
      chatBody.style.display === "flex" ? "none" : "flex";
  });
});
