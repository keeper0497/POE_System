import React from "react";
import { useNavigate } from "react-router-dom"; // To handle navigation
import Form from "../components/Form";

function Login() {
    const navigate = useNavigate(); // Initialize navigate function

    const handleSignupRedirect = () => {
        navigate("/signup"); // Redirect to the signup page
    };

    const currentYear = new Date().getFullYear(); // Get the current year dynamically

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={styles.landingSection}>
                    <h1 style={styles.title}>Welcome to GeoTraker Application</h1>
                    <p style={styles.description}>
                        Streamline your workflow with our powerful employee tracking and geofencing solution. 
                        Log in to start managing projects or sign up to create an account today.
                    </p>
                    {/* <button style={styles.signupButton} onClick={handleSignupRedirect}>
                        Sign Up
                    </button> */}
                </div>
                <div style={styles.formSection}>
                    <h2 style={styles.formTitle}>Login to Your Account</h2>
                    <Form route="/api/token/" method="login" />
                </div>
            </div>
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <p style={styles.footerText}>© {currentYear} Your Company Name. All rights reserved.</p>
                    <ul style={styles.footerLinks}>
                        <li>
                            <a href="/privacy" style={styles.link}>
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a href="/terms" style={styles.link}>
                                Terms of Service
                            </a>
                        </li>
                        <li>
                            <a href="/contact" style={styles.link}>
                                Contact Us
                            </a>
                        </li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
    },
    content: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "40px 20px",
        flexGrow: 1,
    },
    landingSection: {
        flex: 1,
        padding: "20px",
        textAlign: "center",
    },
    title: {
        fontSize: "2.5rem",
        marginBottom: "20px",
        color: "#102C57",
        fontWeight: "bold",
    },
    description: {
        fontSize: "1.2rem",
        marginBottom: "30px",
        color: "#555",
        lineHeight: "1.6",
    },
    signupButton: {
        padding: "12px 24px",
        fontSize: "1rem",
        backgroundColor: "#4CAF50",
        color: "#fff",
        border: "none",
        borderRadius: "25px",
        cursor: "pointer",
        transition: "background-color 0.3s",
    },
    signupButtonHover: {
        backgroundColor: "#45a049",
    },
    formSection: {
        flex: 1,
        padding: "30px",
        backgroundColor: "#fff",
        borderRadius: "15px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    },
    formTitle: {
        fontSize: "1.8rem",
        marginBottom: "20px",
        color: "#102C57",
        fontWeight: "bold",
        textAlign: "center",
    },
    footer: {
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#102C57",
        color: "#fff",
    },
    footerContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },
    footerText: {
        fontSize: "0.9rem",
        marginBottom: "5px",
    },
    footerLinks: {
        display: "flex",
        gap: "15px",
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
    link: {
        color: "#fff",
        textDecoration: "none",
        fontSize: "0.9rem",
        fontWeight: "bold",
        transition: "color 0.3s",
    },
    linkHover: {
        color: "#4CAF50",
    },
};

export default Login;
