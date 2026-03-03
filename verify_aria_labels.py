
from playwright.sync_api import Page, expect, sync_playwright

def verify_aria_labels(page: Page):
    print("Navigating to http://localhost:3000...")
    page.goto("http://localhost:3000")

    print(f"Page title: {page.title()}")

    # Take a debug screenshot immediately
    page.screenshot(path="/home/jules/verification/debug_initial.png")

    # Wait for body
    page.wait_for_selector("body")

    # Wait for something likely to be there.
    # App.tsx has "AI QUANTIZER" in h1
    print("Waiting for 'AI QUANTIZER' text...")
    expect(page.get_by_text("AI QUANTIZER")).to_be_visible()

    print("Waiting for .pod-card...")
    page.wait_for_selector(".pod-card")

    # Verify PodGrid buttons by label
    print("Verifying ARIA labels...")
    expect(page.get_by_label("Remove pod").first).to_be_visible()
    expect(page.get_by_label("Open new tab").first).to_be_visible()
    expect(page.get_by_label("Back").first).to_be_visible()
    expect(page.get_by_label("Forward").first).to_be_visible()
    expect(page.get_by_label("Reload").first).to_be_visible()
    expect(page.get_by_label("Toggle Local AR").first).to_be_visible()
    expect(page.get_by_label("More options").first).to_be_visible()

    # Verify ControlPanel buttons/inputs
    expect(page.get_by_label("Manual injection")).to_be_visible()
    expect(page.get_by_label("Send injection")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="/home/jules/verification/aria_verification.png")
    print("Verification successful: All ARIA labels found and visible.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_aria_labels(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/debug_failure.png")
            exit(1)
        finally:
            browser.close()
