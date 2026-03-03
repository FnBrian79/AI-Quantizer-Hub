from playwright.sync_api import Page, expect, sync_playwright

def test_accessibility_labels(page: Page):
    # 1. Arrange: Go to the app.
    page.goto("http://localhost:3000")

    # Wait for the app to load
    page.wait_for_selector("text=AI QUANTIZER")

    # 2. Act & Assert: Check for the presence of elements with the new aria-labels.

    # PodGrid buttons
    # "New Tab" button
    expect(page.get_by_label("New Tab").first).to_be_visible()

    # "Close tab" button - might be multiple, check at least one
    expect(page.get_by_label("Close tab").first).to_be_visible()

    # "Go back"
    expect(page.get_by_label("Go back").first).to_be_visible()

    # "Go forward"
    expect(page.get_by_label("Go forward").first).to_be_visible()

    # "Reload"
    expect(page.get_by_label("Reload").first).to_be_visible()

    # "Toggle AR view"
    expect(page.get_by_label("Toggle AR view").first).to_be_visible()

    # "More options"
    expect(page.get_by_label("More options").first).to_be_visible()

    # ControlPanel button
    # "Send injection"
    expect(page.get_by_label("Send injection")).to_be_visible()

    # PiecesOSContext button
    # "Search context"
    expect(page.get_by_label("Search context")).to_be_visible()

    print("All accessibility labels found!")

    # 3. Screenshot
    page.screenshot(path="/home/jules/verification/accessibility_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_accessibility_labels(page)
        finally:
            browser.close()
