import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import NewDispatch from './pages/NewDispatch';
import DispatchDetails from './pages/DispatchDetails';  // Dodaj import

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/teams"
                            element={
                                <PrivateRoute>
                                    <Teams />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/dispatch/new"
                            element={
                                <PrivateRoute>
                                    <NewDispatch />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/dispatch/:id"
                            element={
                                <PrivateRoute>
                                    <DispatchDetails />
                                </PrivateRoute>
                            }
                        />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;