# Dynamic Portfolio Dashboard

A dynamic portfolio dashboard built using React.js/Next.js, TypeScript, Tailwind CSS, and Node.js. This application displays real-time portfolio data, including current market prices, P/E ratios, and latest earnings, fetched from financial APIs.

## Table of Contents

1. Features
2. Technology Stack
3. Installation
4. Usage
5. Project Structure
6. Commands
7. API Configuration
8. Deployment
9. Contributing
10. License

### Features

#### Real-Time Data Fetching:

* Fetches Current Market Price (CMP) from Yahoo Finance.
* Retrieves P/E Ratio and Latest Earnings from Google Finance.

#### Automatic Updates:

* Live updates every 15 seconds to display the latest financial data.

#### Visual Indicators:

* Green for gains, Red for losses.

#### Sector Grouping:

* Groups stocks by sector with sector-level summaries.

#### Responsive Design:

* Optimized for desktop and mobile using Tailwind CSS.

#### Error Handling:

* Graceful handling of API failures and data fetching issues.

### Technology Stack

* **Frontend:** Next.js (React), TypeScript, Tailwind CSS
* **Backend:** Node.js
* **Data Fetching:** Axios, Fetch API
* **Table Rendering:** react-table
* **Charting:** recharts (optional)

### Installation (IN command Prompt)

1. Clone the repository:


git clone https://github.com/sainarmadach/portfolio-dashboard.git


2. Navigate to the project directory:


cd portfolio-project
cd project
cd portfolio-dashboard


3. Install dependencies:


npm i


4. Run the development server:


npm run dev


5. Open the application:
   Visit [http://localhost:3000](http://localhost:3000) in your browser.
