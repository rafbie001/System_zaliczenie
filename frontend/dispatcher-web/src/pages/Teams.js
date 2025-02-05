import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Card,
    CardContent,
    CardActions,
    Chip,
    Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../services/api';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        vehicle_id: '',
        members: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const data = await getTeams();
            setTeams(data);
        } catch (error) {
            console.error('Błąd podczas pobierania zespołów:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (team = null) => {
        if (team) {
            setEditingTeam(team);
            setFormData({
                name: team.name,
                vehicle_id: team.vehicle_id,
                members: team.members.join(', '),
            });
        } else {
            setEditingTeam(null);
            setFormData({
                name: '',
                vehicle_id: '',
                members: '',
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingTeam(null);
        setFormData({
            name: '',
            vehicle_id: '',
            members: '',
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const teamData = {
            ...formData,
            members: formData.members.split(',').map(member => member.trim()),
        };

        if (editingTeam) {
            await updateTeam(editingTeam._id, teamData);  // Zmiana z id na _id
        } else {
            await createTeam(teamData);
        }

        handleClose();
        fetchTeams();
    } catch (error) {
        console.error('Błąd podczas zapisywania zespołu:', error);
    }
};

    const handleDelete = async (teamId) => {
    if (!teamId) {
        console.error('Brak ID zespołu');
        return;
    }

    if (window.confirm('Czy na pewno chcesz usunąć ten zespół?')) {
        try {
            await deleteTeam(teamId);
            fetchTeams();
        } catch (error) {
            console.error('Błąd podczas usuwania zespołu:', error);
        }
    }
};

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4">Zarządzanie Zespołami</Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpen()}
                            >
                                Dodaj zespół
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            {teams.map((team) => (
                                <Grid item xs={12} sm={6} md={4} key={team.id}>
                                    <Card>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="h6">{team.name}</Typography>
                                                <Chip
                                                    label={team.status === 'available' ? 'Dostępny' : 'Zajęty'}
                                                    color={team.status === 'available' ? 'success' : 'error'}
                                                />
                                            </Box>
                                            <Typography color="textSecondary">
                                                Pojazd: {team.vehicle_id}
                                            </Typography>
                                            <Typography variant="body2">
                                                Zespół: {team.members.join(', ')}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <IconButton onClick={() => handleOpen(team)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(team._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Box>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingTeam ? 'Edytuj zespół' : 'Dodaj nowy zespół'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nazwa zespołu"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Numer pojazdu"
                            fullWidth
                            required
                            value={formData.vehicle_id}
                            onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Członkowie zespołu (oddzieleni przecinkami)"
                            fullWidth
                            required
                            multiline
                            rows={3}
                            value={formData.members}
                            onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                            helperText="Wprowadź imiona i nazwiska członków zespołu, oddzielając je przecinkami"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Anuluj</Button>
                        <Button type="submit" variant="contained">
                            {editingTeam ? 'Zapisz zmiany' : 'Dodaj zespół'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default Teams;