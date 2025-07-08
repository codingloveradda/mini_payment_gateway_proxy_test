"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const charge_1 = __importDefault(require("./routes/charge"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Hello, world!');
});
app.use('/charge', charge_1.default);
app.use('/transactions', transactions_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
