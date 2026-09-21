# Password Generator

A modern, secure, and responsive password generator web application built with **HTML, CSS, and Vanilla JavaScript**.

The application allows users to generate strong passwords using uppercase letters, numbers, and symbols. Passwords are generated directly in the browser using the **Web Crypto API**, so no password data is sent to a server.

Features

- Generate secure random passwords
- Password length from **8 to 64 characters**
- Uppercase letters (`A-Z`)
- Numbers (`0-9`)
- Symbols (`! @ # $ % ...`)
- Lowercase letters are intentionally excluded
- Password strength indicator
- Weak / Medium / Strong / Very Strong strength levels
- Copy password to clipboard
- Show / hide generated password
- Clear password functionality
- Light and dark theme
- Responsive design for desktop, tablet, and mobile
- Keyboard shortcuts
- No backend required
- No external libraries or frameworks
- Password generation happens locally in the browser

Technologies Used

Frontend

- HTML5
- CSS3
- Vanilla JavaScript

Security

- Web Crypto API
- `crypto.getRandomValues()`

 Browser APIs

- Clipboard API
- Local Storage

Project Structure

```text
password-generator/
│
├── index.html
├── style.css
├── script.js
└── README.md
