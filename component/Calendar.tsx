import React, { useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Grid from '@mui/material/Grid2';
import { format } from 'date-fns';


interface Task {
  id: string;
  content: string;
}

const initialTasks: Task[] = [
  { id: 'task-1', content: 'Tâche 1' },
  { id: 'task-2', content: 'Tâche 2' },
  { id: 'task-3', content: 'Tâche 3' },
];

const hours = Array.from({ length: 24 }, (_, i) => i);

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availableTasks, setAvailableTasks] = useState<Task[]>(initialTasks);
  const [schedule, setSchedule] = useState<{ [hour: number]: Task | null }>(
    hours.reduce((acc, hour) => {
      acc[hour] = null;
      return acc;
    }, {} as { [hour: number]: Task | null })
  );

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    // 1. Déplacement depuis la liste vers un créneau horaire
    if (source.droppableId === 'availableTasks' && destination.droppableId.startsWith('hour-')) {
      const hour = parseInt(destination.droppableId.split('-')[1], 10);
      const task = availableTasks[source.index];
      if (schedule[hour]) return; // Le créneau est déjà occupé

      const newAvailableTasks = Array.from(availableTasks);
      newAvailableTasks.splice(source.index, 1);
      setAvailableTasks(newAvailableTasks);
      setSchedule((prev) => ({ ...prev, [hour]: task }));
      return;
    }

    // 2. Déplacement depuis un créneau horaire vers la liste des tâches disponibles
    if (source.droppableId.startsWith('hour-') && destination.droppableId === 'availableTasks') {
      const hour = parseInt(source.droppableId.split('-')[1], 10);
      const task = schedule[hour];
      if (!task) return;

      setSchedule((prev) => ({ ...prev, [hour]: null }));
      const newAvailableTasks = Array.from(availableTasks);
      newAvailableTasks.splice(destination.index, 0, task);
      setAvailableTasks(newAvailableTasks);
      return;
    }

    // 3. Déplacement d'une tâche d'un horaire vers un autre
    if (source.droppableId.startsWith('hour-') && destination.droppableId.startsWith('hour-')) {
      const sourceHour = parseInt(source.droppableId.split('-')[1], 10);
      const destinationHour = parseInt(destination.droppableId.split('-')[1], 10);
      // Si on dépose dans le même créneau, on ne fait rien
      if (sourceHour === destinationHour) return;

      // Si le créneau destination est vide, on déplace la tâche
      if (!schedule[destinationHour]) {
        setSchedule((prev) => ({
          ...prev,
          [destinationHour]: schedule[sourceHour],
          [sourceHour]: null,
        }));
      } else {
        // Sinon, on échange les tâches entre les deux créneaux (swap)
        setSchedule((prev) => ({
          ...prev,
          [destinationHour]: schedule[sourceHour],
          [sourceHour]: schedule[destinationHour],
        }));
      }
    }
  };

  return (
    <Grid container  >
      <Typography variant="h4" align="center" gutterBottom>
        Calendrier des Tâches
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Choisissez une date"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          format="dd/MM/yyyy"
          slotProps={{
            textField: {
              fullWidth: true,
              variant: 'outlined',
              sx: { mb: 2 },
            },
          }}
        />
      </LocalizationProvider>

      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container size={12}  >
          {/* Liste des tâches disponibles */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ p: 2, minHeight: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Tâches Disponibles
              </Typography>
              <Droppable droppableId="availableTasks" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                {(provided) => (
                  <List ref={provided.innerRef} {...provided.droppableProps}>
                    {availableTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ mb: 1 }}
                          >
                            <Paper sx={{ p: 1, width: '100%' }}>
                              <ListItemText primary={task.content} />
                            </Paper>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Paper>
          </Grid>

          {/* Calendrier horaire */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ p: 2, minHeight: 500 }}>
              <Typography variant="h6" gutterBottom>
                Emploi du Temps pour {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}
              </Typography>
              {hours.map((hour) => (
                <Droppable
                  droppableId={`hour-${hour}`}
                  key={hour}
                  isDropDisabled={false}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                >
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        mb: 1,
                        p: 1,
                        bgcolor: snapshot.isDraggingOver ? '#e3f2fd' : '#fafafa',
                      }}
                    >
                      <Grid container alignItems="center">
                        <Grid size={2}>
                          <Typography variant="subtitle1">{hour}:00</Typography>
                        </Grid>
                        <Grid size={10}>
                          {schedule[hour] ? (
                            <Draggable draggableId={schedule[hour]!.id} index={0} key={schedule[hour]!.id}>
                              {(provided) => (
                                <Paper
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{
                                    p: 1,
                                    bgcolor: '#bbdefb',
                                  }}
                                >
                                  <Typography variant="body1">{schedule[hour]!.content}</Typography>
                                </Paper>
                              )}
                            </Draggable>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Vide
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                      {provided.placeholder}
                    </Paper>
                  )}
                </Droppable>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </DragDropContext>
    </Grid>
  );
};

export default Calendar;



