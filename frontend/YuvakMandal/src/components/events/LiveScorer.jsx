import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import { 
  PlayIcon, 
  StopIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const LiveScorer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setAlert } = useContext(AlertContext);
  const {
    currentEvent,
    loading,
    liveScore,
    getEvent,
    joinEventRoom,
    leaveEventRoom,
    updateLiveScore,
    changeInnings,
    completeMatch,
    addCommentary,
    setupSocketListeners
  } = useEvent();

  const [currentTeam, setCurrentTeam] = useState(null);
  const [battingTeam, setBattingTeam] = useState(null);
  const [bowlingTeam, setBowlingTeam] = useState(null);
  
  // Current match state - Initialize from server data
  const [matchState, setMatchState] = useState({
    currentBatsman1: null,
    currentBatsman2: null,
    striker: 1,
    currentBowler: null,
    currentOver: 0,
    currentBall: 0,
    overBalls: [],
    commentary: '',
    inningsNumber: 1,
    totalOvers: 20
  });

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showNextBowlerModal, setShowNextBowlerModal] = useState(false);
  const [showNewBatsmanModal, setShowNewBatsmanModal] = useState(false);
  const [matchSummary, setMatchSummary] = useState({
    winner: '',
    summary: ''
  });

  const canScore = user && (user.role === 'Admin' || (currentEvent && currentEvent.createdBy._id === user.id));

  // Initialize and setup socket connection
  useEffect(() => {
    if (id) {
      getEvent(id);
      joinEventRoom(id);
      setupSocketListeners();
    }

    return () => {
      if (id) {
        leaveEventRoom(id);
      }
    };
  }, [id]);

  // Initialize teams and load existing match state from server
  useEffect(() => {
    if (currentEvent && currentEvent.teams.length >= 2) {
      const firstTeam = currentEvent.teams[0];
      const secondTeam = currentEvent.teams[1];
      
      // Determine current innings and batting team
      const currentInnings = currentEvent.liveScore?.currentInnings || 1;
      const currentBattingTeam = currentInnings === 1 ? firstTeam : secondTeam;
      const currentBowlingTeam = currentInnings === 1 ? secondTeam : firstTeam;
      
      setBattingTeam(currentBattingTeam);
      setBowlingTeam(currentBowlingTeam);
      setCurrentTeam(currentBattingTeam);
      
      // Load existing match state from server data
      const existingLiveScore = currentEvent.liveScore;
      if (existingLiveScore) {
        setMatchState({
          currentBatsman1: existingLiveScore.currentBatsman?.[0] ? 
            { name: existingLiveScore.currentBatsman[0], _id: existingLiveScore.currentBatsman[0] } : null,
          currentBatsman2: existingLiveScore.currentBatsman?.[1] ? 
            { name: existingLiveScore.currentBatsman[1], _id: existingLiveScore.currentBatsman[1] } : null,
          striker: existingLiveScore.striker || 1,
          currentBowler: existingLiveScore.currentBowler ? 
            { name: existingLiveScore.currentBowler, _id: existingLiveScore.currentBowler } : null,
          currentOver: existingLiveScore.overs || 0,
          currentBall: existingLiveScore.balls || 0,
          overBalls: existingLiveScore.overBalls || [],
          commentary: existingLiveScore.commentary || '',
          inningsNumber: currentInnings,
          totalOvers: existingLiveScore.totalOvers || 20
        });
      } else {
        // Fresh match - keep default state
        setMatchState(prev => ({
          ...prev,
          totalOvers: currentEvent.format === 'T20' ? 20 : currentEvent.format === 'ODI' ? 50 : 20,
          inningsNumber: currentInnings
        }));
      }
    }
  }, [currentEvent]);

  // Real-time sync with socket updates - This is crucial for multi-window/device sync
  useEffect(() => {
    if (liveScore && currentEvent) {
      console.log('Receiving live score update:', liveScore);
      
      // Update teams with latest scores
      const updatedTeams = currentEvent.teams.map(team => {
        if (team._id === liveScore.teamId) {
          return {
            ...team,
            score: {
              runs: liveScore.runs || 0,
              wickets: liveScore.wickets || 0,
              overs: liveScore.overs || 0,
              balls: liveScore.balls || 0
            }
          };
        }
        return team;
      });

      // Find current batting team
      const currentBattingTeam = updatedTeams.find(team => 
        team._id === liveScore.teamId
      );
      
      if (currentBattingTeam) {
        setCurrentTeam(currentBattingTeam);
        
        // Update batting/bowling teams based on innings
        if (liveScore.currentInnings === 1) {
          setBattingTeam(updatedTeams[0]);
          setBowlingTeam(updatedTeams[1]);
        } else {
          setBattingTeam(updatedTeams[1]);
          setBowlingTeam(updatedTeams[0]);
        }
      }

      // CRITICAL: Sync match state with received live score data
      setMatchState(prevState => {
        const newState = {
          currentBatsman1: liveScore.currentBatsman?.[0] ? 
            { name: liveScore.currentBatsman[0], _id: liveScore.currentBatsman[0] } : prevState.currentBatsman1,
          currentBatsman2: liveScore.currentBatsman?.[1] ? 
            { name: liveScore.currentBatsman[1], _id: liveScore.currentBatsman[1] } : prevState.currentBatsman2,
          striker: liveScore.striker || prevState.striker,
          currentBowler: liveScore.currentBowler ? 
            { name: liveScore.currentBowler, _id: liveScore.currentBowler } : prevState.currentBowler,
          currentOver: liveScore.overs || 0,
          currentBall: liveScore.balls || 0,
          overBalls: liveScore.overBalls || [],
          commentary: liveScore.commentary || prevState.commentary,
          inningsNumber: liveScore.currentInnings || prevState.inningsNumber,
          totalOvers: liveScore.totalOvers || prevState.totalOvers
        };
        
        console.log('Updated match state:', newState);
        return newState;
      });
    }
  }, [liveScore]);

  // Get all players from a team
  const getTeamPlayers = (team) => {
    return team ? team.players : [];
  };

  // Get available batsmen (not out)
  const getAvailableBatsmen = (team) => {
    return getTeamPlayers(team).filter(player => 
      !player.stats?.isOut && 
      player._id !== matchState.currentBatsman1?._id && 
      player._id !== matchState.currentBatsman2?._id
    );
  };

  // Get available bowlers (from bowling team, not current bowler)
  const getAvailableBowlers = (team) => {
    return getTeamPlayers(team).filter(player => 
      player._id !== matchState.currentBowler?._id
    );
  };

  // Handle score entry with improved real-time sync
  const handleScoreEntry = async (runs, isExtra = false, extraType = null) => {
    try {
      let newMatchState = { ...matchState };
      let newBall = matchState.currentBall;
      let newOver = matchState.currentOver;
      let ballEntry = '';
      let commentary = '';

      // Handle extras (Wide, No Ball, Bye, Leg Bye)
      if (isExtra) {
        switch (extraType) {
          case 'wide':
            ballEntry = `W${runs > 1 ? `+${runs-1}` : ''}`;
            commentary = `Wide ball! ${runs} extra run${runs > 1 ? 's' : ''} to the batting team.`;
            break;
          case 'noball':
            ballEntry = `Nb${runs > 1 ? `+${runs-1}` : ''}`;
            commentary = `No ball! ${runs} extra run${runs > 1 ? 's' : ''} to the batting team.`;
            break;
          case 'bye':
            ballEntry = `B${runs}`;
            commentary = `${runs} bye${runs > 1 ? 's' : ''}`;
            newBall++;
            break;
          case 'legbye':
            ballEntry = `Lb${runs}`;
            commentary = `${runs} leg bye${runs > 1 ? 's' : ''}`;
            newBall++;
            break;
        }
      } else {
        // Regular runs
        ballEntry = runs.toString();
        if (runs === 4) {
          ballEntry = '4';
          commentary = `FOUR! Beautiful shot by ${matchState.striker === 1 ? matchState.currentBatsman1?.name : matchState.currentBatsman2?.name}`;
        } else if (runs === 6) {
          ballEntry = '6';
          commentary = `SIX! What a shot by ${matchState.striker === 1 ? matchState.currentBatsman1?.name : matchState.currentBatsman2?.name}!`;
        } else if (runs === 0) {
          ballEntry = '•';
          commentary = `Dot ball. Good bowling by ${matchState.currentBowler?.name}`;
        } else {
          commentary = `${runs} run${runs > 1 ? 's' : ''} taken`;
        }
        newBall++;
      }

      // Rotate strike for odd runs (only for regular runs and some extras)
      if (!isExtra || (extraType === 'bye' || extraType === 'legbye')) {
        if (runs % 2 === 1) {
          newMatchState.striker = newMatchState.striker === 1 ? 2 : 1;
        }
      }

      // Check if over is complete
      if (newBall === 6) {
        newOver++;
        newBall = 0;
        // Rotate strike at the end of over
        newMatchState.striker = newMatchState.striker === 1 ? 2 : 1;
        commentary += ` End of over ${newOver}.`;
        
        // Show next bowler selection if not the last over
        if (newOver < matchState.totalOvers) {
          setShowNextBowlerModal(true);
        }
      }

      // Update over balls array
      let updatedOverBalls = [...matchState.overBalls, ballEntry];
      if (newBall === 0 && newOver > matchState.currentOver) {
        updatedOverBalls = []; // Reset for new over
      }

      // Update match state
      newMatchState.currentBall = newBall;
      newMatchState.currentOver = newOver;
      newMatchState.commentary = commentary;
      newMatchState.overBalls = updatedOverBalls;

      // Update local state immediately for responsive UI
      setMatchState(newMatchState);

      // Calculate new score
      const newRuns = (currentTeam?.score?.runs || 0) + runs;

      // Update current team with new score
      const updatedCurrentTeam = {
        ...currentTeam,
        score: {
          ...currentTeam.score,
          runs: newRuns,
          overs: newOver,
          balls: newBall
        }
      };
      setCurrentTeam(updatedCurrentTeam);

      // CRITICAL: Send comprehensive update to server for real-time sync
      const updateData = {
        eventId: currentEvent._id,
        teamId: currentTeam._id,
        runs: newRuns,
        wickets: currentTeam?.score?.wickets || 0,
        overs: newOver,
        balls: newBall,
        currentBatsman: [
          newMatchState.currentBatsman1?.name || '',
          newMatchState.currentBatsman2?.name || ''
        ],
        currentBowler: newMatchState.currentBowler?.name || '',
        striker: newMatchState.striker,
        lastBall: ballEntry,
        overBalls: updatedOverBalls,
        currentInnings: newMatchState.inningsNumber,
        commentary: commentary,
        totalOvers: newMatchState.totalOvers
      };

      // Send to server - this will broadcast to all connected clients
      await updateLiveScore(updateData);
      await addCommentary(currentEvent._id, commentary, newOver, newBall);

      // Check if innings is complete
      if (newOver >= matchState.totalOvers || (currentTeam?.score?.wickets || 0) >= 10) {
        handleInningsComplete();
      }

    } catch (error) {
      console.error('Error updating score:', error);
      setAlert('Error updating score', 'error');
    }
  };

  // Handle wicket with improved sync
  const handleWicket = async (wicketType = 'out') => {
    try {
      const newWickets = (currentTeam?.score?.wickets || 0) + 1;
      let commentary = '';
      
      const outBatsman = matchState.striker === 1 ? matchState.currentBatsman1 : matchState.currentBatsman2;
      
      switch (wicketType) {
        case 'bowled':
          commentary = `BOWLED! ${outBatsman?.name} is bowled by ${matchState.currentBowler?.name}`;
          break;
        case 'caught':
          commentary = `CAUGHT! ${outBatsman?.name} is caught`;
          break;
        case 'lbw':
          commentary = `LBW! ${outBatsman?.name} is given out`;
          break;
        case 'runout':
          commentary = `RUN OUT! ${outBatsman?.name} is run out`;
          break;
        default:
          commentary = `OUT! ${outBatsman?.name} is dismissed`;
      }

      // Update match state
      const newMatchState = { ...matchState };
      newMatchState.currentBall++;
      let updatedOverBalls = [...matchState.overBalls, 'W'];
      newMatchState.commentary = commentary;

      // Check if over is complete
      if (newMatchState.currentBall === 6) {
        newMatchState.currentOver++;
        newMatchState.currentBall = 0;
        newMatchState.striker = newMatchState.striker === 1 ? 2 : 1;
        updatedOverBalls = [];
      }

      newMatchState.overBalls = updatedOverBalls;
      setMatchState(newMatchState);

      // Update current team with new wickets
      const updatedCurrentTeam = {
        ...currentTeam,
        score: {
          ...currentTeam.score,
          wickets: newWickets,
          overs: newMatchState.currentOver,
          balls: newMatchState.currentBall
        }
      };
      setCurrentTeam(updatedCurrentTeam);

      // Send comprehensive update to server
      const updateData = {
        eventId: currentEvent._id,
        teamId: currentTeam._id,
        runs: currentTeam?.score?.runs || 0,
        wickets: newWickets,
        overs: newMatchState.currentOver,
        balls: newMatchState.currentBall,
        currentBatsman: [
          newMatchState.currentBatsman1?.name || '',
          newMatchState.currentBatsman2?.name || ''
        ],
        currentBowler: newMatchState.currentBowler?.name || '',
        striker: newMatchState.striker,
        lastBall: 'W',
        overBalls: updatedOverBalls,
        currentInnings: newMatchState.inningsNumber,
        commentary: commentary,
        totalOvers: newMatchState.totalOvers
      };

      await updateLiveScore(updateData);
      await addCommentary(currentEvent._id, commentary, newMatchState.currentOver, newMatchState.currentBall);

      // Check if innings is complete
      if (newWickets >= 10 || newMatchState.currentOver >= matchState.totalOvers) {
        handleInningsComplete();
      } else {
        // Show new batsman selection
        setShowNewBatsmanModal(true);
      }
    } catch (error) {
      console.error('Error handling wicket:', error);
      setAlert('Error updating wicket', 'error');
    }
  };

  // Handle innings complete
  const handleInningsComplete = async () => {
    try {
      if (matchState.inningsNumber === 1 && currentEvent.teams.length > 1) {
        // Start second innings
        const newInnings = 2;
        setBattingTeam(currentEvent.teams[1]);
        setBowlingTeam(currentEvent.teams[0]);
        setCurrentTeam(currentEvent.teams[1]);
        
        const newMatchState = {
          currentBatsman1: null,
          currentBatsman2: null,
          striker: 1,
          currentBowler: null,
          currentOver: 0,
          currentBall: 0,
          overBalls: [],
          commentary: '',
          inningsNumber: newInnings,
          totalOvers: matchState.totalOvers
        };
        
        setMatchState(newMatchState);

        // Send innings change to server
        await changeInnings(currentEvent._id, newInnings);
        
        // Update server with new innings state
        const updateData = {
          eventId: currentEvent._id,
          teamId: currentEvent.teams[1]._id,
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          currentBatsman: ['', ''],
          currentBowler: '',
          striker: 1,
          lastBall: '',
          overBalls: [],
          currentInnings: newInnings,
          commentary: 'Second innings started',
          totalOvers: matchState.totalOvers
        };
        
        await updateLiveScore(updateData);
        setAlert('First innings complete! Select batsmen and bowler for second innings.', 'info');
      } else {
        // Match complete
        setShowCompleteModal(true);
      }
    } catch (error) {
      console.error('Error completing innings:', error);
      setAlert('Error completing innings', 'error');
    }
  };

  // Handle new bowler selection
  const handleNewBowler = async (bowler) => {
    const updatedState = {
      ...matchState,
      currentBowler: bowler
    };
    
    setMatchState(updatedState);
    
    // Send update to server
    const updateData = {
      eventId: currentEvent._id,
      teamId: currentTeam._id,
      runs: currentTeam?.score?.runs || 0,
      wickets: currentTeam?.score?.wickets || 0,
      overs: matchState.currentOver,
      balls: matchState.currentBall,
      currentBatsman: [
        matchState.currentBatsman1?.name || '',
        matchState.currentBatsman2?.name || ''
      ],
      currentBowler: bowler.name,
      striker: matchState.striker,
      lastBall: '',
      overBalls: matchState.overBalls,
      currentInnings: matchState.inningsNumber,
      commentary: `${bowler.name} comes in to bowl`,
      totalOvers: matchState.totalOvers
    };
    
    await updateLiveScore(updateData);
    setShowNextBowlerModal(false);
  };

  // Handle new batsman selection
  const handleNewBatsman = async (batsman) => {
    const newMatchState = { ...matchState };
    
    if (newMatchState.striker === 1) {
      newMatchState.currentBatsman1 = batsman;
    } else {
      newMatchState.currentBatsman2 = batsman;
    }
    
    setMatchState(newMatchState);
    
    // Send update to server
    const updateData = {
      eventId: currentEvent._id,
      teamId: currentTeam._id,
      runs: currentTeam?.score?.runs || 0,
      wickets: currentTeam?.score?.wickets || 0,
      overs: newMatchState.currentOver,
      balls: newMatchState.currentBall,
      currentBatsman: [
        newMatchState.currentBatsman1?.name || '',
        newMatchState.currentBatsman2?.name || ''
      ],
      currentBowler: newMatchState.currentBowler?.name || '',
      striker: newMatchState.striker,
      lastBall: '',
      overBalls: newMatchState.overBalls,
      currentInnings: newMatchState.inningsNumber,
      commentary: `${batsman.name} comes in to bat`,
      totalOvers: newMatchState.totalOvers
    };
    
    await updateLiveScore(updateData);
    setShowNewBatsmanModal(false);
  };

  // Handle player selection updates
  const handlePlayerSelection = async (type, player) => {
    const newMatchState = { ...matchState };
    
    switch (type) {
      case 'batsman1':
        newMatchState.currentBatsman1 = player;
        newMatchState.striker = 1;
        break;
      case 'batsman2':
        newMatchState.currentBatsman2 = player;
        break;
      case 'bowler':
        newMatchState.currentBowler = player;
        break;
    }
    
    setMatchState(newMatchState);
    
    // Send update to server
    const updateData = {
      eventId: currentEvent._id,
      teamId: currentTeam._id,
      runs: currentTeam?.score?.runs || 0,
      wickets: currentTeam?.score?.wickets || 0,
      overs: newMatchState.currentOver,
      balls: newMatchState.currentBall,
      currentBatsman: [
        newMatchState.currentBatsman1?.name || '',
        newMatchState.currentBatsman2?.name || ''
      ],
      currentBowler: newMatchState.currentBowler?.name || '',
      striker: newMatchState.striker,
      lastBall: '',
      overBalls: newMatchState.overBalls,
      currentInnings: newMatchState.inningsNumber,
      commentary: `${player.name} selected as ${type}`,
      totalOvers: newMatchState.totalOvers
    };
    
    await updateLiveScore(updateData);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentEvent || currentEvent.status !== 'ongoing' || currentEvent.teams.length < 2) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Cannot Start Live Scoring</h3>
        <p className="text-gray-600 mb-4">
          {!currentEvent ? 'Event not found' :
           currentEvent.status !== 'ongoing' ? 'Event is not currently ongoing' :
           'At least 2 teams are required for live scoring'}
        </p>
        <button
          onClick={() => navigate(currentEvent ? `/events/${currentEvent._id}` : '/events')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {currentEvent ? 'View Event Details' : 'Back to Events'}
        </button>
      </div>
    );
  }

  const formatScore = (team) => {
    return `${team?.score?.runs || 0}/${team?.score?.wickets || 0} (${team?.score?.overs || 0}.${team?.score?.balls || 0})`;
  };

  const calculateRunRate = (runs, overs, balls) => {
    const totalOvers = overs + (balls / 6);
    return totalOvers > 0 ? (runs / totalOvers).toFixed(2) : '0.00';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/events/${currentEvent._id}`)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentEvent.name}</h1>
            <p className="text-gray-600">
              Innings {matchState.inningsNumber} - Over {matchState.currentOver}.{matchState.currentBall}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-600">LIVE</span>
          </div>
          
          {canScore && (
            <button
              onClick={() => setShowCompleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <StopIcon className="w-5 h-5 inline mr-2" />
              Complete Match
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Score Cards */}
        <div className="lg:col-span-3 space-y-6">
          {/* Team Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Batting Team */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-green-500 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{battingTeam?.teamName}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Batting
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatScore(currentTeam)}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Run Rate: {calculateRunRate(currentTeam?.score?.runs || 0, matchState.currentOver, matchState.currentBall)}</div>
                  <div>Required RR: {matchState.inningsNumber === 2 ? 'TBD' : '-'}</div>
                </div>
              </div>
            </div>

            {/* Bowling Team */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{bowlingTeam?.teamName}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Bowling
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {matchState.inningsNumber === 1 ? '-' : formatScore(bowlingTeam)}
                </div>
                <div className="text-sm text-gray-600">
                  {matchState.inningsNumber === 1 ? 'Waiting to bat' : `Target: ${(currentEvent.teams[0].score?.runs || 0) + 1}`}
                </div>
              </div>
            </div>
          </div>

          {/* Current Match Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {matchState.currentBatsman1?.name || 'Select'}
                </div>
                <div className="text-sm text-gray-600">
                  Batsman 1 {matchState.striker === 1 ? '(Strike)' : ''}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {matchState.currentBatsman2?.name || 'Select'}
                </div>
                <div className="text-sm text-gray-600">
                  Batsman 2 {matchState.striker === 2 ? '(Strike)' : ''}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {matchState.currentBowler?.name || 'Select'}
                </div>
                <div className="text-sm text-gray-600">Bowler</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {matchState.currentOver}.{matchState.currentBall}
                </div>
                <div className="text-sm text-gray-600">
                  Over.Ball
                </div>
              </div>
            </div>

            {/* This Over */}
            {matchState.overBalls.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-2">This Over:</h4>
                <div className="flex space-x-2">
                  {matchState.overBalls.map((ball, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 ${
                        ball === 'W' ? 'bg-red-100 text-red-800' :
                        ball.includes('4') ? 'bg-green-100 text-green-800' :
                        ball.includes('6') ? 'bg-purple-100 text-purple-800' :
                        ball.includes('W') || ball.includes('Nb') ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      } rounded-full flex items-center justify-center text-xs font-medium`}
                    >
                      {ball}
                    </div>
                  ))}
                  {/* Show remaining balls */}
                  {Array.from({ length: 6 - matchState.overBalls.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-xs text-gray-400"
                    >
                      -
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commentary */}
            {matchState.commentary && (
              <div className="mt-4 pt-4 border-t">
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="text-sm text-gray-700">{matchState.commentary}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scoring Controls */}
        {canScore && (
          <div className="space-y-6">
            {/* Player Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Players</h3>
              
              {!matchState.currentBatsman1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batsman 1</label>
                  <select
                    onChange={(e) => {
                      const player = battingTeam.players.find(p => p._id === e.target.value);
                      setMatchState(prev => ({ ...prev, currentBatsman1: player, striker: 1 }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select Batsman</option>
                    {getTeamPlayers(battingTeam).map(player => (
                      <option key={player._id} value={player._id}>{player.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {!matchState.currentBatsman2 && matchState.currentBatsman1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batsman 2</label>
                  <select
                    onChange={(e) => {
                      const player = battingTeam.players.find(p => p._id === e.target.value);
                      setMatchState(prev => ({ ...prev, currentBatsman2: player }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select Batsman</option>
                    {getTeamPlayers(battingTeam)
                      .filter(p => p._id !== matchState.currentBatsman1?._id)
                      .map(player => (
                        <option key={player._id} value={player._id}>{player.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {!matchState.currentBowler && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bowler</label>
                  <select
                    onChange={(e) => {
                      const player = bowlingTeam.players.find(p => p._id === e.target.value);
                      setMatchState(prev => ({ ...prev, currentBowler: player }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select Bowler</option>
                    {getTeamPlayers(bowlingTeam).map(player => (
                      <option key={player._id} value={player._id}>{player.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Scoring Buttons */}
            {matchState.currentBatsman1 && matchState.currentBatsman2 && matchState.currentBowler && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Entry</h3>
                
                {/* Runs */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Runs</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3, 4, 6].map(runs => (
                      <button
                        key={runs}
                        onClick={() => handleScoreEntry(runs)}
                        className={`px-3 py-2 rounded text-sm font-medium ${
                          runs === 4 ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                          runs === 6 ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                          'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {runs === 0 ? 'Dot' : runs}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extras */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Extras</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleScoreEntry(1, true, 'wide')}
                      className="px-3 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded text-sm font-medium"
                    >
                      Wide
                    </button>
                    <button
                      onClick={() => handleScoreEntry(1, true, 'noball')}
                      className="px-3 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded text-sm font-medium"
                    >
                      No Ball
                    </button>
                    <button
                      onClick={() => handleScoreEntry(1, true, 'bye')}
                      className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium"
                    >
                      Bye
                    </button>
                    <button
                      onClick={() => handleScoreEntry(1, true, 'legbye')}
                      className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium"
                    >
                      Leg Bye
                    </button>
                  </div>
                </div>

                {/* Wicket */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wicket</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['bowled', 'caught', 'lbw', 'runout'].map(wicketType => (
                      <button
                        key={wicketType}
                        onClick={() => handleWicket(wicketType)}
                        className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium capitalize"
                      >
                        {wicketType === 'lbw' ? 'LBW' : wicketType === 'runout' ? 'Run Out' : wicketType}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Strike Info */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">
                    On Strike: {matchState.striker === 1 ? matchState.currentBatsman1?.name : matchState.currentBatsman2?.name}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    Ball {matchState.currentBall + 1} of Over {matchState.currentOver + 1}
                  </div>
                </div>
              </div>
            )}

            {/* Match Progress */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overs Completed</span>
                  <span className="font-medium">{matchState.currentOver}/{matchState.totalOvers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(matchState.currentOver / matchState.totalOvers) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Balls in Current Over</span>
                  <span className="font-medium">{matchState.currentBall}/6</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Bowler Modal */}
      {showNextBowlerModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Next Bowler</h3>
              <p className="text-sm text-gray-600 mb-4">Over {matchState.currentOver} completed. Choose the bowler for over {matchState.currentOver + 1}.</p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getAvailableBowlers(bowlingTeam).map(player => (
                  <button
                    key={player._id}
                    onClick={() => handleNewBowler(player)}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.role}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setShowNextBowlerModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Batsman Modal */}
      {showNewBatsmanModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select New Batsman</h3>
              <p className="text-sm text-gray-600 mb-4">
                {matchState.striker === 1 ? matchState.currentBatsman1?.name : matchState.currentBatsman2?.name} is out. 
                Select the next batsman.
              </p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getAvailableBatsmen(battingTeam).map(player => (
                  <button
                    key={player._id}
                    onClick={() => handleNewBatsman(player)}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.role}</div>
                  </button>
                ))}
              </div>

              {getAvailableBatsmen(battingTeam).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">No more batsmen available. Innings complete.</p>
                  <button
                    onClick={handleInningsComplete}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Complete Innings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Match Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Match</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Winner</label>
                  <select
                    value={matchSummary.winner}
                    onChange={(e) => setMatchSummary(prev => ({ ...prev, winner: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Winner</option>
                    {currentEvent.teams.map(team => (
                      <option key={team._id} value={team.teamName}>{team.teamName}</option>
                    ))}
                    <option value="Tie">Tie</option>
                    <option value="No Result">No Result</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Match Summary</label>
                  <textarea
                    value={matchSummary.summary}
                    onChange={(e) => setMatchSummary(prev => ({ ...prev, summary: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Brief summary of the match result..."
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => {
                    if (!matchSummary.winner.trim()) {
                      setAlert('Please select a winner', 'error');
                      return;
                    }
                    completeMatch(currentEvent._id, matchSummary.winner, matchSummary.summary);
                    setShowCompleteModal(false);
                    setAlert('Match completed successfully', 'success');
                    navigate(`/events/${currentEvent._id}`);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Complete Match
                </button>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Summary Display */}
      {matchState.inningsNumber === 2 && currentEvent.teams[0] && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">First Innings</h4>
              <div className="text-2xl font-bold text-gray-900">
                {currentEvent.teams[0].teamName}: {formatScore(currentEvent.teams[0])}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Second Innings</h4>
              <div className="text-2xl font-bold text-gray-900">
                {currentEvent.teams[1].teamName}: {formatScore(currentEvent.teams[1])}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Target: {(currentEvent.teams[0].score?.runs || 0) + 1} runs
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Commentary */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Commentary</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {matchState.commentary && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-start">
                <span className="text-sm text-blue-900">{matchState.commentary}</span>
                <span className="text-xs text-blue-600 whitespace-nowrap ml-2">
                  {matchState.currentOver}.{matchState.currentBall}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Guide */}
      {canScore && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            Scoring Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">Ball Counting:</h4>
              <ul className="space-y-1 text-yellow-800">
                <li>• Regular runs: Ball count increases</li>
                <li>• Wide/No Ball: Ball count stays same</li>
                <li>• Bye/Leg Bye: Ball count increases</li>
                <li>• 6 balls = 1 over complete</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">Strike Rotation:</h4>
              <ul className="space-y-1 text-yellow-800">
                <li>• Odd runs: Strike rotates</li>
                <li>• Even runs: Strike stays same</li>
                <li>• End of over: Strike always rotates</li>
                <li>• Wicket: New batsman takes strike</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScorer;