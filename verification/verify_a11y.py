
import sys
from playwright.sync_api import sync_playwright

def verify_accessibility_labels():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Navigating to http://localhost:3000")
        page.goto("http://localhost:3000")

        # Wait for the app to mount. Since 'text=AI QUANTIZER' timed out, let's try waiting for #root to have children
        # or just wait for a known element like the header
        try:
            print("Waiting for header content...")
            page.wait_for_selector("h1", timeout=10000)
        except Exception as e:
            print(f"Error waiting for selector: {e}")
            # Take a screenshot to see what's wrong
            page.screenshot(path="verification/error_state.png")
            print("📸 Error screenshot taken at verification/error_state.png")
            sys.exit(1)

        print("Page loaded. Checking ControlPanel...")

        # Check manual injection input
        try:
            input_locator = page.get_by_label("Manual injection command")
            if input_locator.count() > 0:
                print("✅ 'Manual injection command' input found")
            else:
                print("❌ 'Manual injection command' input NOT found")
        except Exception as e:
            print(f"Error checking input: {e}")

        # Check manual injection button
        try:
            send_btn = page.get_by_label("Send manual injection")
            if send_btn.count() > 0:
                print("✅ 'Send manual injection' button found")
            else:
                print("❌ 'Send manual injection' button NOT found")
        except Exception as e:
            print(f"Error checking send button: {e}")

        print("Checking PodGrid...")
        try:
            # We need to wait for pods to be rendered.
            page.wait_for_selector(".pod-card", timeout=5000)

            remove_btn = page.get_by_label("Remove pod").first
            if remove_btn.count() > 0:
                print("✅ 'Remove pod' button found")
            else:
                 print("❌ 'Remove pod' button NOT found")

            plus_btn = page.get_by_label("New tab").first
            if plus_btn.count() > 0:
                print("✅ 'New tab' button found")
            else:
                 print("❌ 'New tab' button NOT found")

            prev_btn = page.get_by_label("Previous tab").first
            if prev_btn.count() > 0:
                print("✅ 'Previous tab' button found")
            else:
                 print("❌ 'Previous tab' button NOT found")

            url_input = page.get_by_label("Pod URL").first
            if url_input.count() > 0:
                print("✅ 'Pod URL' input found")
            else:
                 print("❌ 'Pod URL' input NOT found")

        except Exception as e:
             print(f"Error checking PodGrid (maybe no pods?): {e}")

        print("Checking App selects...")
        try:
            select_a = page.get_by_label("Select Partner A")
            if select_a.count() > 0:
                print("✅ 'Select Partner A' found")
            else:
                 print("❌ 'Select Partner A' NOT found")
        except Exception as e:
             print(f"Error checking App selects: {e}")

        # Take a screenshot to confirm visual integrity (though these changes are invisible labels)
        page.screenshot(path="verification/verification.png")
        print("📸 Screenshot taken at verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_accessibility_labels()
