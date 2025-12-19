const Event = require('./models/Events');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Join event room for live score updates
    socket.on('join-event', (eventId) => {
      socket.join(`event-${eventId}`);
      console.log(`👥 User ${socket.id} joined event ${eventId}`);
      
      // Send current event data to the newly joined user
      Event.findById(eventId)
        .then(event => {
          if (event) {
            socket.emit('event-data', event);
          }
        })
        .catch(err => console.error('Error fetching event data:', err));
    });

    // Leave event room
    socket.on('leave-event', (eventId) => {
      socket.leave(`event-${eventId}`);
      console.log(`👋 User ${socket.id} left event ${eventId}`);
    });

    // Handle live score update
    socket.on('update-live-score', async (data) => {
      try {
        const { 
          eventId, 
          teamId, 
          runs, 
          wickets, 
          overs, 
          balls, 
          currentBatsman,
          currentBowler,
          lastBall,
          playerStats 
        } = data;

        console.log('📊 Updating live score for event:', eventId);

        const event = await Event.findById(eventId);
        if (!event) {
          socket.emit('error', { message: 'Event not found' });
          return;
        }

        // Find the team to update
        const team = event.teams.id(teamId);
        if (!team) {
          socket.emit('error', { message: 'Team not found' });
          return;
        }

        // Update team score
        if (runs !== undefined) team.score.runs = runs;
        if (wickets !== undefined) team.score.wickets = wickets;
        if (overs !== undefined) team.score.overs = overs;
        if (balls !== undefined) team.score.balls = balls;

        // Update live score details
        if (currentBatsman) event.liveScore.currentBatsman = currentBatsman;
        if (currentBowler) event.liveScore.currentBowler = currentBowler;
        
        // Add last ball to the array (keep only last 6 balls)
        if (lastBall) {
          event.liveScore.lastBalls.push(lastBall);
          if (event.liveScore.lastBalls.length > 6) {
            event.liveScore.lastBalls.shift();
          }
        }

        // Update player statistics
        if (playerStats && Array.isArray(playerStats)) {
          playerStats.forEach(stat => {
            const player = team.players.id(stat.playerId);
            if (player) {
              Object.assign(player.stats, stat.stats);
            }
          });
        }

        await event.save();

        // Emit updated score to all users in the event room
        const updateData = {
          eventId,
          teamId,
          teamScore: team.score,
          liveScore: event.liveScore,
          timestamp: new Date()
        };

        io.to(`event-${eventId}`).emit('score-updated', updateData);
        socket.emit('update-success', { message: 'Score updated successfully' });

        console.log('✅ Score updated successfully for event:', eventId);

      } catch (error) {
        console.error('❌ Error updating live score:', error);
        socket.emit('error', { message: 'Failed to update score' });
      }
    });

    // Handle innings change
    socket.on('change-innings', async (data) => {
      try {
        const { eventId, inningsNumber } = data;

        console.log('🔄 Changing innings for event:', eventId);

        const event = await Event.findById(eventId);
        if (!event) {
          socket.emit('error', { message: 'Event not found' });
          return;
        }

        event.liveScore.currentInnings = inningsNumber;
        event.liveScore.currentBatsman = [];
        event.liveScore.currentBowler = '';
        event.liveScore.lastBalls = [];

        await event.save();

        const updateData = {
          eventId,
          currentInnings: inningsNumber,
          liveScore: event.liveScore,
          timestamp: new Date()
        };

        io.to(`event-${eventId}`).emit('innings-changed', updateData);
        socket.emit('update-success', { message: 'Innings changed successfully' });

        console.log('✅ Innings changed successfully for event:', eventId);

      } catch (error) {
        console.error('❌ Error changing innings:', error);
        socket.emit('error', { message: 'Failed to change innings' });
      }
    });

    // Handle match completion
    socket.on('complete-match', async (data) => {
      try {
        const { eventId, winner, summary } = data;

        console.log('🏆 Completing match for event:', eventId);

        const event = await Event.findById(eventId);
        if (!event) {
          socket.emit('error', { message: 'Event not found' });
          return;
        }

        event.status = 'past';
        event.liveScore.isLive = false;
        event.matchResult = {
          winner,
          summary,
          completedAt: new Date()
        };

        await event.save();

        const updateData = {
          eventId,
          status: 'past',
          matchResult: event.matchResult,
          timestamp: new Date()
        };

        io.to(`event-${eventId}`).emit('match-completed', updateData);
        socket.emit('update-success', { message: 'Match completed successfully' });

        console.log('✅ Match completed successfully for event:', eventId);

      } catch (error) {
        console.error('❌ Error completing match:', error);
        socket.emit('error', { message: 'Failed to complete match' });
      }
    });

    // Handle commentary update
    socket.on('add-commentary', async (data) => {
      try {
        const { eventId, commentary, over, ball } = data;

        console.log('💬 Adding commentary for event:', eventId);

        const updateData = {
          eventId,
          commentary,
          over,
          ball,
          timestamp: new Date()
        };

        io.to(`event-${eventId}`).emit('commentary-added', updateData);
        socket.emit('update-success', { message: 'Commentary added successfully' });

        console.log('✅ Commentary added successfully for event:', eventId);

      } catch (error) {
        console.error('❌ Error adding commentary:', error);
        socket.emit('error', { message: 'Failed to add commentary' });
      }
    });

    // Handle general error
    socket.on('error', (error) => {
      console.error('🔥 Socket error:', error);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id);
    });
  });

  // Log active connections every 30 seconds (optional)
  setInterval(() => {
    const connectedSockets = io.engine.clientsCount;
    if (connectedSockets > 0) {
      console.log(`📊 Active Socket.IO connections: ${connectedSockets}`);
    }
  }, 30000);
};

module.exports = socketHandler;