import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    Card,
    CardContent,
    CardActions,
    Chip,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTeams, getDispatches, deleteDispatch } from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [dispatches, setDispatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [teamsData, dispatchesData] = await Promise.all([
                getTeams(),
                getDispatches()
            ]);
            setTeams(teamsData);
            setDispatches(dispatchesData.filter(d => d.status === 'pending'));
        } catch (error) {
            console.error('Błąd podczas pobierania danych:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDispatch = async (dispatchId) => {
        if (window.confirm('Czy na pewno chcesz usunąć to zgłoszenie?')) {
            try {
                await deleteDispatch(dispatchId);
                fetchData(); // Odśwież dane po usunięciu
            } catch (error) {
                console.error('Błąd podczas usuwania zgłoszenia:', error);
                alert('Nie udało się usunąć zgłoszenia');
            }
        }
    };

    const getStatusColor = (status) => {
        return status === 'available' ? 'success' : 'error';
    };

    if (loading) {
        return (
            <Container>
                <Typography>Ładowanie...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} key="header">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h4">Panel Dyspozytora</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/dispatch/new')}
                        >
                            Nowe zgłoszenie
                        </Button>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6} key="teams-section">
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Zespoły Ratownicze
                        </Typography>
                        <Grid container spacing={2}>
                            {teams.map((team) => (
                                <Grid item xs={12} key={`team-${team._id}`}>
                                    <Card>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="h6">{team.name}</Typography>
                                                <Chip
                                                    label={team.status === 'available' ? 'Dostępny' : 'Zajęty'}
                                                    color={getStatusColor(team.status)}
                                                />
                                            </Box>
                                            <Typography color="textSecondary">
                                                Pojazd: {team.vehicle_id}
                                            </Typography>
                                            <Typography variant="body2">
                                                Zespół: {team.members.join(', ')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                            {teams.length === 0 && (
                                <Grid item xs={12} key="no-teams">
                                    <Typography align="center" color="textSecondary">
                                        Brak dostępnych zespołów
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6} key="dispatches-section">
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Aktywne Zgłoszenia
                        </Typography>
                        <Grid container spacing={2}>
                            {dispatches.map((dispatch) => (
                                <Grid item xs={12} key={`dispatch-${dispatch._id}`}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">
                                                {dispatch.caller_name}
                                            </Typography>
                                            <Typography color="textSecondary">
                                                Tel: {dispatch.caller_phone}
                                            </Typography>
                                            <Typography variant="body2">
                                                Adres: {dispatch.address}
                                            </Typography>
                                            {dispatch.description && (
                                                <Typography variant="body2">
                                                    Opis: {dispatch.description}
                                                </Typography>
                                            )}
                                        </CardContent>
                                        <CardActions>
                                            <Button
                                                size="small"
                                                onClick={() => navigate(`/dispatch/${dispatch._id}`)}
                                            >
                                                Szczegóły
                                            </Button>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteDispatch(dispatch._id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                            {dispatches.length === 0 && (
                                <Grid item xs={12} key="no-dispatches">
                                    <Typography align="center" color="textSecondary">
                                        Brak aktywnych zgłoszeń
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;