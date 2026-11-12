
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://qaxsdissrtgwootwhwbw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7wdpaQFsPQFn4uvHx-lamg_PH3fVkZz";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

// Page elements
const loadingMessage = document.getElementById("loading-message");
const accessMessage = document.getElementById("access-message");
const projectContent = document.getElementById("project-content");
const logoutButton = document.getElementById("logout-button");

// Show purchase button for logged-in users without access
function showPurchaseButton() {
    loadingMessage.hidden = true;
    projectContent.hidden = true;

    accessMessage.replaceChildren();

    const message = document.createElement("p");
    message.textContent =
        "You are logged in, but you have not purchased Project 02 yet.";

    const buyButton = document.createElement("button");
    buyButton.type = "button";
    buyButton.textContent = "Buy Project 02 – ₹1";
    buyButton.id = "buy-project-button";

    buyButton.addEventListener("click", purchaseProject);

    accessMessage.append(message, buyButton);
}

// Start Razorpay payment
async function purchaseProject() {
    const buyButton = document.getElementById("buy-project-button");

    try {
        buyButton.disabled = true;
        buyButton.textContent = "Creating order...";

        if (!window.Razorpay) {
            throw new Error("Razorpay checkout could not be loaded.");
        }

        // Step 1: Create Razorpay order
        const { data: orderData, error: orderError } =
            await supabase.functions.invoke(
                "create-razorpay-order",
                {
                    method: "POST"
                }
            );

        if (orderError) throw orderError;

        if (
            !orderData ||
            !orderData.order_id ||
            !orderData.key_id
        ) {
            throw new Error("Invalid order details received from server.");
        }

        // Step 2: Open Razorpay checkout
        const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Shivam Kumar",
            description: orderData.project_title || "Project 02",
            order_id: orderData.order_id,

            handler: async function (response) {
                try {
                    accessMessage.textContent =
                        "Payment received. Verifying payment...";

                    // Step 3: Verify payment on Supabase
                    const { data, error } =
                        await supabase.functions.invoke(
                            "verify-razorpay-payment",
                            {
                                method: "POST",
                                body: {
                                    razorpay_order_id:
                                        response.razorpay_order_id,
                                    razorpay_payment_id:
                                        response.razorpay_payment_id,
                                    razorpay_signature:
                                        response.razorpay_signature
                                }
                            }
                        );

                    if (error) throw error;

                    accessMessage.textContent =
                        "Payment verified. Loading Project 02...";

                    // Step 4: Check access again and load project
                    await loadPremiumProject();

                } catch (error) {
                    accessMessage.textContent =
                        "Payment verification failed: " + error.message;
                }
            },

            modal: {
                ondismiss: function () {
                    buyButton.disabled = false;
                    buyButton.textContent = "Buy Project 02 – ₹1";
                }
            },

            theme: {
                color: "#2563eb"
            }
        };

        const razorpay = new window.Razorpay(options);

        razorpay.on("payment.failed", function (response) {
            accessMessage.textContent =
                "Payment failed: " +
                (response.error.description || "Please try again.");

            buyButton.disabled = false;
            buyButton.textContent = "Buy Project 02 – ₹1";
        });

        razorpay.open();

    } catch (error) {
        accessMessage.textContent =
            "Unable to start payment: " + error.message;

        buyButton.disabled = false;
        buyButton.textContent = "Buy Project 02 – ₹1";
    }
}

// Check login and purchase access
async function loadPremiumProject() {
    try {
        loadingMessage.hidden = false;
        accessMessage.replaceChildren();
        projectContent.hidden = true;

        // Step 1: Check login
        const {
            data: { session },
            error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
            window.location.href = "../login/login.html";
            return;
        }

        // Step 2: Verify purchase access
        const { data, error } = await supabase.functions.invoke(
            "get-premium-project",
            {
                method: "GET"
            }
        );

        if (error) {
            let responseBody = null;

            try {
                responseBody = await error.context.clone().json();
            } catch {
                // Response body may not be available as JSON.
            }

            const isPurchaseRequired =
                error.context?.status === 403 ||
                responseBody?.error === "Purchase required" ||
                error.message?.includes("Purchase required");

            if (isPurchaseRequired) {
                showPurchaseButton();
                return;
            }

            throw error;
        }

        if (!data || !data.html || !data.css) {
            throw new Error("Project content could not be loaded.");
        }

        // Step 3: Display protected project inside iframe
        const iframe = document.createElement("iframe");

        iframe.title = "Premium Project 02";
        iframe.style.position = "fixed";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100vw";
        iframe.style.height = "100vh";
        iframe.style.border = "none";
        iframe.style.margin = "0";
        iframe.style.padding = "0";
        iframe.style.background = "#ffffff";
        iframe.style.zIndex = "9999";

        const projectBaseURL =
            "https://shiv-the-star-lord.github.io/my-portfolio/microsoft-projects/fabric-projects/fabric-de-projects/project-02/";

        const projectHTML = data.html.replace(
            "</head>",
            `<base href="${projectBaseURL}">
             <style>${data.css}</style>
             </head>`
        );

        iframe.srcdoc = projectHTML;
        projectContent.replaceChildren(iframe);

        loadingMessage.hidden = true;
        projectContent.hidden = false;

    } catch (error) {
        loadingMessage.hidden = true;
        accessMessage.textContent =
            "Unable to load the premium project: " + error.message;
    }
}

// Logout
logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;

    const { error } = await supabase.auth.signOut();

    if (error) {
        accessMessage.textContent = error.message;
        logoutButton.disabled = false;
        return;
    }

    window.location.href = "login.html";
});

// Start verification
loadPremiumProject();


