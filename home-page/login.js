
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Replace these two values with your Supabase project details.
const SUPABASE_URL = "https://qaxsdissrtgwootwhwbw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7wdpaQFsPQFn4uvHx-lamg_PH3fVkZz";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// Form elements
const authForm = document.getElementById("auth-form");
const formTitle = document.getElementById("form-title");
const formDescription = document.getElementById("form-description");
const nameGroup = document.getElementById("name-group");
const fullNameInput = document.getElementById("full-name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitButton = document.getElementById("submit-button");
const authMessage = document.getElementById("auth-message");
const switchText = document.getElementById("switch-text");
const switchButton = document.getElementById("switch-button");

let isSignUp = false;

// Switch between Login and Create Account
switchButton.addEventListener("click", () => {
    isSignUp = !isSignUp;

    authMessage.textContent = "";
    authForm.reset();

    if (isSignUp) {
        formTitle.textContent = "Create Account";
        formDescription.textContent =
            "Register to access premium projects.";
        nameGroup.hidden = false;
        fullNameInput.required = true;
        passwordInput.autocomplete = "new-password";
        submitButton.textContent = "Create Account";
        switchText.textContent = "Already have an account?";
        switchButton.textContent = "Login";
    } else {
        formTitle.textContent = "Welcome Back";
        formDescription.textContent =
            "Login to access your premium projects.";
        nameGroup.hidden = true;
        fullNameInput.required = false;
        passwordInput.autocomplete = "current-password";
        submitButton.textContent = "Login";
        switchText.textContent = "Don't have an account?";
        switchButton.textContent = "Create Account";
    }
});

// Handle Login and Registration
authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    authMessage.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const fullName = fullNameInput.value.trim();

    submitButton.disabled = true;
    submitButton.textContent = isSignUp
        ? "Creating Account..."
        : "Logging In...";

    try {
        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                authMessage.textContent =
                    "Account created successfully. You can now log in to access your projects.";
            } else {
                authMessage.textContent =
                    "Registration successful! Please check your email and confirm your account before logging in.";
            }
        } else {
            const { error } =
                await supabase.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) throw error;

            authMessage.textContent =
                "Login successful! Redirecting to Project 02...";

                window.location.href = "premium-project.html";
        }
    } catch (error) {
        authMessage.textContent = error.message;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = isSignUp
            ? "Create Account"
            : "Login";
    }
});
