require('dotenv').config();
const { ethers } = require('ethers');

// Load environment variables
const { RPC_URL, PRIVATE_KEY } = process.env;

// Setup provider and wallet
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Define router address and contract ABI
const routerAddress = '0x88628442473A25a01626Cbd29703a11E5666CD93';
const routerABI = [
    'function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external payable returns (uint[] memory amounts)'
];

// Create a contract instance
const routerContract = new ethers.Contract(routerAddress, routerABI, wallet);

async function swapETHForTokens() {
    const amountOutMin = ethers.utils.parseUnits('0.0001', 18); // Minimum amount of DAI expected (adjust as needed)
    const path = [
        '0x6f11f80cbd3a9723648f0ba9921bc7b4c8dd6a94', // ART address
        '0x4997b8907b6fd3c30de941cdb79d273428586e78'  // DAI address
    ];
    const to = wallet.address; // Address to receive the DAI
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // Deadline set to 20 minutes from now

    const tx = {
        to: routerAddress,
        value: ethers.utils.parseEther('0.0001'), // Amount of ETH to swap
        data: routerContract.interface.encodeFunctionData('swapExactETHForTokens', [
            amountOutMin,
            path,
            to,
            deadline
        ]),
        gasLimit: 2000000 // Set a higher gas limit manually
    };

    try {
        await wallet.sendTransaction(tx);
        await provider.waitForTransaction(tx.hash);
    } catch {
        // Handle errors silently
    }
}

// Loop to continuously perform swaps
async function runSwapLoop() {
    while (true) {
        await swapETHForTokens();
    }
}

runSwapLoop();
