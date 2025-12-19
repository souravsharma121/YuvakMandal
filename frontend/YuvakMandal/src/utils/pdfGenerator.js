import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Function to generate event flyer PDF
export const generateEventFlyerPDF = async (event) => {
  try {
    // Create a temporary DOM element for the flyer design
    const flyerElement = createFlyerHTML(event);
    document.body.appendChild(flyerElement);

    // Convert HTML to canvas
    const canvas = await html2canvas(flyerElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: 1200
    });

    // Remove the temporary element
    document.body.removeChild(flyerElement);

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions to fit A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add image to PDF
    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // If image is too tall, scale it down
      const scaledHeight = pdfHeight;
      const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
      const xOffset = (pdfWidth - scaledWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
    }

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Function to create HTML structure for the flyer
const createFlyerHTML = (event) => {
  const flyerElement = document.createElement('div');
  flyerElement.style.position = 'absolute';
  flyerElement.style.left = '-9999px';
  flyerElement.style.width = '800px';
  flyerElement.style.height = '1200px';
  flyerElement.style.fontFamily = 'Arial, sans-serif';
  flyerElement.style.backgroundColor = '#ffffff';
  flyerElement.style.overflow = 'hidden';

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const eventTypeIcons = {
    cricket: '🏏',
    volleyball: '🏐',
    football: '⚽',
    kabaddi: '🤼',
    'kho-kho': '🏃',
    badminton: '🏸',
    'table-tennis': '🏓',
    other: '🏆'
  };

  const backgroundStyle = event.backgroundImage 
    ? `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}${event.backgroundImage}); background-size: cover; background-position: center;`
    : 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';

  flyerElement.innerHTML = `
    <div style="width: 100%; height: 100%; ${backgroundStyle} position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 60px 40px; box-sizing: border-box; color: white; text-align: center;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 72px; margin-bottom: 20px;">${eventTypeIcons[event.type] || '🏆'}</div>
        <h1 style="font-size: 56px; font-weight: bold; margin: 0 0 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); line-height: 1.2;">${event.name}</h1>
        <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 15px 30px; border-radius: 50px; display: inline-block; margin-bottom: 30px;">
          <span style="font-size: 24px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">${event.type.replace('-', ' ')}</span>
        </div>
      </div>

      <!-- Event Details -->
      <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 20px; padding: 40px; margin: 20px 0;">
        
        <!-- Date & Time -->
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 25px; font-size: 22px;">
          <div style="background: rgba(255,255,255,0.2); padding: 15px 25px; border-radius: 15px; margin: 0 10px; flex: 1; text-align: center;">
            <div style="font-size: 18px; opacity: 0.8; margin-bottom: 5px;">📅 DATE</div>
            <div style="font-weight: bold;">${eventDate}</div>
          </div>
          <div style="background: rgba(255,255,255,0.2); padding: 15px 25px; border-radius: 15px; margin: 0 10px; flex: 1; text-align: center;">
            <div style="font-size: 18px; opacity: 0.8; margin-bottom: 5px;">🕐 TIME</div>
            <div style="font-weight: bold;">${event.time}</div>
          </div>
        </div>

        <!-- Location -->
        <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px; margin-bottom: 25px; text-align: center;">
          <div style="font-size: 18px; opacity: 0.8; margin-bottom: 8px;">📍 VENUE</div>
          <div style="font-size: 26px; font-weight: bold;">${event.location}</div>
        </div>

        <!-- Entry Fee -->
        <div style="background: rgba(255,215,0,0.9); color: #333; padding: 20px; border-radius: 15px; margin-bottom: 25px; text-align: center;">
          <div style="font-size: 18px; margin-bottom: 8px;">💰 ENTRY FEE</div>
          <div style="font-size: 36px; font-weight: bold;">₹${event.entryFee}</div>
        </div>

        <!-- Team Info -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
          <div style="background: rgba(255,255,255,0.2); padding: 15px 20px; border-radius: 15px; flex: 1; margin-right: 10px; text-align: center;">
            <div style="font-size: 16px; opacity: 0.8; margin-bottom: 5px;">👥 MAX TEAMS</div>
            <div style="font-size: 24px; font-weight: bold;">${event.maxTeams}</div>
          </div>
          ${event.type === 'cricket' ? `
          <div style="background: rgba(255,255,255,0.2); padding: 15px 20px; border-radius: 15px; flex: 1; margin-left: 10px; text-align: center;">
            <div style="font-size: 16px; opacity: 0.8; margin-bottom: 5px;">🏏 OVERS</div>
            <div style="font-size: 24px; font-weight: bold;">${event.liveScore?.totalOvers || 20}</div>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Instructions -->
      <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; margin: 20px 0;">
        <h3 style="font-size: 28px; margin-bottom: 20px; color: #fff;">📋 INSTRUCTIONS & RULES</h3>
        <div style="font-size: 18px; line-height: 1.6; text-align: left; color: rgba(255,255,255,0.95);">
          ${event.instructions.split('\n').map(line => `<p style="margin: 10px 0;">${line}</p>`).join('')}
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px;">
        <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 20px; border-radius: 20px;">
          <div style="font-size: 20px; margin-bottom: 10px;">⚡ REGISTER NOW ⚡</div>
          ${event.registrationDeadline ? `
            <div style="font-size: 16px; opacity: 0.9;">Registration closes on ${new Date(event.registrationDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          ` : ''}
          <div style="font-size: 14px; margin-top: 15px; opacity: 0.8;">Created by ${event.createdBy.name}</div>
        </div>
      </div>
    </div>
  `;

  return flyerElement;
};

// Function to download PDF
export const downloadEventFlyer = async (event) => {
  try {
    const pdf = await generateEventFlyerPDF(event);
    const filename = `${event.name.replace(/[^a-z0-9]/gi, '_')}_flyer.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error downloading flyer:', error);
    throw error;
  }
};

// Function to generate team list PDF
export const generateTeamListPDF = (event) => {
  const pdf = new jsPDF();
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text(event.name, 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(14);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Event Type: ${event.type}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Location: ${event.location}`, 20, yPosition);
  yPosition += 15;

  // Teams
  event.teams.forEach((team, teamIndex) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(`Team ${teamIndex + 1}: ${team.teamName}`, 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Captain: ${team.captain}`, 20, yPosition);
    yPosition += 10;

    pdf.text('Players:', 20, yPosition);
    yPosition += 7;

    team.players.forEach((player, index) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const playerText = `${index + 1}. ${player.name} (${player.age} years) - ${player.role} - ${player.contact}`;
      pdf.text(playerText, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 10;
  });

  return pdf;
};

// Function to download team list
export const downloadTeamList = (event) => {
  try {
    const pdf = generateTeamListPDF(event);
    const filename = `${event.name.replace(/[^a-z0-9]/gi, '_')}_teams.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error downloading team list:', error);
    throw error;
  }
};