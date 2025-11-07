# Office Supplies Inventory

This project is an inventory management application designed to help users manage office supplies efficiently. It allows users to add, view, and manage items in their inventory, including details such as item name, category, quantity, minimum stock, supplier, and price.

## Features

- **Add New Items**: Users can add new items to the inventory through a user-friendly form.
- **Category Selection**: Items can be categorized into predefined categories such as Writing, Paper, Tools, Electronics, Furniture, Cleaning, and Other.
- **Data Storage**: The application integrates with Supabase for data storage, ensuring that all inventory data is securely stored and easily retrievable.
- **Responsive Design**: The UI components are designed to be responsive and user-friendly.

## Project Structure

```
office-supplies-inventory
├── src
│   ├── components
│   │   ├── AddItemDialog.tsx
│   │   └── ui
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       └── index.ts
│   ├── contexts
│   │   └── AppContext.tsx
│   ├── lib
│   │   └── supabaseClient.ts
│   ├── types
│   │   └── index.ts
│   └── App.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd office-supplies-inventory
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```

This will launch the application in your default web browser.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.