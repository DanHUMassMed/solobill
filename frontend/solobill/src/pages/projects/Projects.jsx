import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  InputAdornment, 
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useProjects } from '../../hooks/useProjects';
import ProjectDialog from './ProjectDialog';

export default function Projects() {
  const { projects, clients, snackbar, closeSnackbar, saveProject, deleteProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null });

  const handleOpenDialog = (project = null) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProject(null);
  };

  const handleSave = async (projectData, additionalFields, setErrors) => {
    const result = await saveProject(projectData, additionalFields);
    if (result.success) {
      handleCloseDialog();
    } else if (result.errors) {
      setErrors(result.errors);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmation({ open: true, id });
  };

  const handleDelete = async () => {
    if (deleteConfirmation.id) {
      await deleteProject(deleteConfirmation.id);
      setDeleteConfirmation({ open: false, id: null });
    }
  };

  // Group projects by client
  const getProjectsByClient = () => {
    const filteredProjects = projects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.poNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = {};
    clients.forEach(client => {
      const clientProjects = filteredProjects.filter(p => p.clientId === client.id);
      if (clientProjects.length > 0) {
        grouped[client.id] = {
          clientName: client.name,
          projects: clientProjects
        };
      }
    });
    
    // Include orphaned projects if any (though UI prevents this, good for safety)
    const orphanProjects = filteredProjects.filter(p => !clients.find(c => c.id === p.clientId));
    if (orphanProjects.length > 0) {
        grouped['unknown'] = {
            clientName: 'Unknown Client',
            projects: orphanProjects
        };
    }

    return grouped;
  };

  const groupedProjects = getProjectsByClient();

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Add Project
        </Button>
      </Box>

      <Paper sx={{ p: 1, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </Paper>

      {Object.keys(groupedProjects).length === 0 ? (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
           No projects found. Add a new project to get started.
        </Typography>
      ) : (
        Object.values(groupedProjects).map((group) => (
          <Accordion key={group.clientName} defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              sx={{ bgcolor: '#f5f5f5' }}
            >
              <Typography variant="h6">{group.clientName}</Typography>
              <Chip size="small" label={group.projects.length} sx={{ ml: 2 }} />
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              <Grid container spacing={3}>
                {group.projects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <Card variant="outlined" sx={{ 
                        height: '100%',
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: 'column'
                    }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" component="div">
                                {project.name}
                            </Typography>
                            <Chip 
                                label={project.poNumber || 'TBD'} 
                                size="small" 
                                variant="outlined" 
                                color={project.poNumber ? 'default' : 'warning'}
                            />
                        </Box>
                        
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          {project.contractingTitle || 'No Title'}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Rate: ${project.contractingRate}/hr
                        </Typography>

                        {project.contractingDesc && (
                            <Typography variant="body2" color="text.secondary" sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {project.contractingDesc}
                            </Typography>
                        )}
                      </CardContent>
                      <CardActions disableSpacing sx={{ justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(project)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => confirmDelete(project.id)}>
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      <ProjectDialog 
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        project={selectedProject}
        clients={clients}
      />

      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, id: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this project? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDeleteConfirmation({ open: false, id: null })}>Cancel</Button>
            <Button onClick={handleDelete} color="error" autoFocus>
            Delete
            </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={closeSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}