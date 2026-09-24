# AICL website prototype

A clickable prototype of the restructured Avail International Consult website: 48 pages in the current AICL look, working on computers, tablets and phones.

- `index.html` is the homepage.
- `pages.html` lists every page, grouped (core, destinations, services, tests and tools, content, locations, campaign pages). "All pages" in the thin bar at the top of each page returns here.
- `runtime.js` runs the interactive parts: FAQ answers, Eligibility Checker, Cost Estimator, booking picker, blog tabs, the free-guide slide-in and the phone menu. No build step and no install.
- `responsive.css` adapts the pages for tablets and phones.
- `fonts/` and `img/` hold the fonts (Roboto, Roboto Slab, Quicksand, Poppins) and the logo, flags and photos from the current website.

## Put it on GitHub Pages (free)

1. Sign in at github.com and click **New repository**. Name it, for example, `aicl-prototype`, choose **Public**, and click **Create repository**.
2. On the new repository's page, click **uploading an existing file**.
3. Open the unzipped `aicl-website` folder on your computer, select everything inside it (not the folder itself), and drag it all onto the upload area. Include the `fonts` and `img` folders.
4. Click **Commit changes** and wait for the upload to finish.
5. Go to **Settings > Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, choose **main** and **/ (root)**, and click **Save**.
6. After a minute or two, the site is live at `https://<your-username>.github.io/aicl-prototype/`. The Pages settings screen shows the link once it is ready.

To update the site later, upload the changed files the same way; GitHub Pages republishes automatically.

## Other ways to view it

- **On your computer:** unzip and double-click `index.html` or `pages.html`.
- **Netlify Drop:** drag the unzipped folder onto https://app.netlify.com/drop for an instant public link.

## Before this goes live

- Text in [square brackets] is a placeholder for AICL to supply: opening hours, event dates and venues, test fees and schedules, maps, team photos and article text.
- Cost Estimator figures are samples. Real figures need sources and an "as of" date.
- Forms are not connected. Every submit button opens the thank-you page. A few footer and download links (privacy policy, PDF downloads, review buttons) go nowhere in this demo.
- The free-guide slide-in appears once per visit after 15 seconds or half-way down a page (40 seconds is recommended for the live site). The purple "Free guide" tab reopens it.
- The yellow notes show which stage of the marketing pipeline each section serves. The button in the top bar turns them off.
- The real site should keep its existing page addresses (for example `/countries/uk/`) so Google rankings carry over.
