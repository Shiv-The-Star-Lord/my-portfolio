
// =========================================
// 1. MOBILE NAVIGATION MENU
// =========================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {

    navLinks.classList.toggle("open");

    const isOpen = navLinks.classList.contains("open");

    menuToggle.setAttribute("aria-expanded", isOpen);

});


// =========================================
// 2. CLOSE MENU AFTER CLICKING A LINK
// =========================================

const navigationLinks = document.querySelectorAll(".nav-link");

navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.classList.remove("open");

        menuToggle.setAttribute("aria-expanded", "false");

        navigationLinks.forEach(function (item) {
            item.classList.remove("active");
        });

        link.classList.add("active");

    });

});


// =========================================
// 3. AUTOMATIC COPYRIGHT YEAR
// =========================================

const currentYear = document.getElementById("currentYear");

currentYear.textContent = new Date().getFullYear();


// =========================================
// 4. WEBSITE INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Portfolio website loaded successfully!");

    console.log("Senior Analytics Engineer Portfolio");

});
