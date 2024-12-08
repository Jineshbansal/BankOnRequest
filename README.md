# BankOnRequest
BankOnRequest is a decentralised bank application built on top of sepolia blockchain and request network.In this bank anybody can lend anytoken and can earn the constant interest of 8% on that token. Also anybody can borrow any token for the collateral of any other token for the 12% interest on the borrowing token on the basis of price feed provided by Oracle.The borrower can do the payment in native currency,ERC20 currency and ERC777 stream payment.User can track their transactions with the help of request network.
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or 
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Usage

- You can lend and borrow tokens on the basis of real time market data using the frontend GUI (**Graphical User Interface**) or the one deployed [Link](https://bank-on-request.vercel.app/).
- A user can easily take the loan of ERC20 token available on our application for any collateral token, The amount of collateral token is decided by fetching the live price of token by using oracle .He/she had to give the constant interest of 12% of amount borrow.A user can select the installment period and specify the number of installments.A request would be automatically created for a user demanding the repayment of loan to smart contract.A user can go to dashboard and can watch all the loan installments he/she had to pay.Either he/she can do batch payment or go to individual request and pay the request with EthSepolia, ERC20token and ERC777 stream payment method.Everytime he/she borrows or repay the loan the invoice pdf is generated automatically.
- A user can easily lend any ERC20 token available on our application and get the constant interest of 8%. .User can go to dashboard and with the lended amount anytime he wants.Also he would get the invoice everytime he/she lend or withdraws some tokens to or from smart contract


## Implementation Details
![App Architecture](./images/architechture.jpg)


## Demo Video Link
Click [here](https://www.loom.com/share/54b09e46543d4cf3b81b245e9f5d3186?sid=b49d1343-753c-4ad4-9fa4-2147cb774593) to see a working demo!

## Learn More

To learn more about Request Network, take a look at the following resources:
- [RequestNetwork Documentation](https://docs.request.network/) - learn about Request Network features.
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
