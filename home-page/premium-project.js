
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Use the SAME Supabase details as login.js
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

// Check login and purchase access
async function loadPremiumProject() {
    try {
        loadingMessage.hidden = false;
        accessMessage.textContent = "";

        // Step 1: Check whether the user is logged in.
        const {
            data: { session },
            error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
            window.location.href = "login.html";
            return;
        }

        // Step 2: Ask the Edge Function to verify purchase access.
        const { data, error } = await supabase.functions.invoke(
            "get-premium-project",
            {
                method: "GET"
            }
        );

        if (error) {
            throw error;
        }

        if (!data || !data.html || !data.css) {
            throw new Error("Project content could not be loaded.");
        }

        // Step 3: Display the protected project inside an iframe.
// Step 3: Create a full-screen protected project iframe.
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
