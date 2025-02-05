import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Button,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getDispatch, getMedicalForm } from '../services/api';

const DispatchDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dispatch, setDispatch] = useState(null);
    const [medicalForm, setMedicalForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchDispatchData();
        } else {
            setError('Nieprawidłowe ID zgłoszenia');
            setLoading(false);
        }
    }, [id]);

    const fetchDispatchData = async () => {
        try {
            setLoading(true);
            setError('');
            const dispatchData = await getDispatch(id);
            if (!dispatchData) {
                throw new Error('Nie znaleziono zgłoszenia');
            }
            setDispatch(dispatchData);

            if (dispatchData.status === 'completed') {
                try {
                    const formData = await getMedicalForm(id);
                    setMedicalForm(formData);
                } catch (error) {
                    console.log('Brak karty medycznej');
                }
            }
        } catch (error) {
            console.error('Błąd podczas pobierania danych:', error);
            setError(error.message || 'Nie udało się pobrać szczegółów zgłoszenia');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Powrót
            </Button>

            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h5" gutterBottom>
                                Szczegóły zgłoszenia
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Chip
                                label={dispatch?.status === 'completed' ? 'Zakończone' : 'W trakcie'}
                                color={dispatch?.status === 'completed' ? 'success' : 'warning'}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Zgłaszający
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {dispatch?.caller_name}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Telefon
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {dispatch?.caller_phone}
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Adres
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {dispatch?.address}
                        </Typography>
                    </Grid>

                    {dispatch?.description && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Opis sytuacji
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {dispatch.description}
                            </Typography>
                        </Grid>
                    )}

                    {medicalForm && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Karta medyczna
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Pacjent
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {medicalForm.patient_name}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Wiek
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {medicalForm.patient_age}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Parametry życiowe
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Ciśnienie: {medicalForm.vital_signs.blood_pressure}<br />
                                    Puls: {medicalForm.vital_signs.pulse}<br />
                                    Temperatura: {medicalForm.vital_signs.temperature}°C<br />
                                    Saturacja: {medicalForm.vital_signs.saturation}%
                                </Typography>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Paper>
        </Container>
    );
};

export default DispatchDetails;