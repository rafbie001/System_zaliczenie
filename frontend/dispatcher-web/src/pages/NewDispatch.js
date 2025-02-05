import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Box,
    Alert,
} from '@mui/material';
import { getTeams, createDispatch } from '../services/api';

const initialFormState = {
    team_id: '',  // Inicjalizacja pustym stringiem zamiast undefined
    caller_name: '',
    caller_phone: '',
    address: '',
    description: ''
};

const NewDispatch = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const teamsData = await getTeams();
            setTeams(teamsData.filter(team => team.status === 'available'));
        } catch (error) {
            console.error('Błąd podczas pobierania zespołów:', error);
            setError('Nie udało się pobrać listy dostępnych zespołów');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Osobna funkcja do obsługi zmiany zespołu
    const handleTeamChange = (e) => {
        setFormData(prev => ({
            ...prev,
            team_id: e.target.value || '' // Zapewnienie, że wartość nigdy nie będzie undefined
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.team_id) {
                throw new Error('Wybierz zespół');
            }

            await createDispatch({
                ...formData,
                team_id: formData.team_id // Upewnienie się, że team_id jest zawsze stringiem
            });
            navigate('/');
        } catch (error) {
            console.error('Błąd podczas tworzenia zgłoszenia:', error);
            setError(error.message || 'Nie udało się utworzyć zgłoszenia. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Nowe Zgłoszenie
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Imię i nazwisko zgłaszającego"
                                name="caller_name"
                                value={formData.caller_name}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Telefon"
                                name="caller_phone"
                                value={formData.caller_phone}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Adres"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Opis sytuacji"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                multiline
                                rows={4}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel id="team-select-label">Wybierz zespół</InputLabel>
                                <Select
                                    labelId="team-select-label"
                                    id="team-select"
                                     name="team_id"
                                     value={formData.team_id || ''} // Dodane zabezpieczenie
                                     onChange={handleTeamChange}
                                     label="Wybierz zespół"
                                >
                                     <MenuItem value="" key="empty">
                                        <em>Wybierz zespół</em>
                                     </MenuItem>
                                     {teams.map((team) => (
                                        <MenuItem
                                           key={`team-${team._id}`}
                                           value={team._id}
                                        >
                                           {team.name} - {team.vehicle_id}
                                        </MenuItem>
                                     ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Anuluj
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                >
                                    {loading ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default NewDispatch;



