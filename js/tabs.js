export function initializeTabs() {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    function openTab(tabName) {
        // Hide all content sections
        contents.forEach(content => {
            content.style.display = "none";
            content.classList.remove("active-tab");
        });

        // Remove active class from all tabs
        tabs.forEach(tab => tab.classList.remove("active"));

        // Show selected content and mark tab as active
        const selectedContent = document.getElementById(tabName);
        const selectedTab = document.querySelector(`[data-target="${tabName}"]`);

        if (selectedContent) {
            selectedContent.style.display = "block";
            selectedContent.classList.add("active-tab");
        }

        if (selectedTab) {
            selectedTab.classList.add("active");
        }
    }

    // Add click handlers to tabs
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-target");
            openTab(target);
        });
    });

    // Open default tab
    if (tabs.length > 0) {
        const defaultTab = tabs[0].getAttribute("data-target");
        openTab(defaultTab);
    }

    // Expose openTab to window for HTML onclick handlers
    window.openTab = openTab;
}