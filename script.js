document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const drawButton = document.getElementById('draw-button');
    const restartButton = document.getElementById('restart-button');
    const exportButton = document.getElementById('export-button');
    const currentDrawContainer = document.getElementById('current-draw');
    const teamsContainer = document.getElementById('teams-container');
    const membersLeftSpan = document.getElementById('members-left');
    const cardFlipSound = document.getElementById('card-flip-sound');
    const teamCompleteSound = document.getElementById('team-complete-sound'); // Optional sound

    // --- Configuration ---
    const TOTAL_MEMBERS = 41;
    const TEAM_SIZE = 4;
    const GOLDEN_CARD_ID = 7; // *** Set which member ID (1-41) gets the golden card ***

    // --- Member Names ---
    // !!! REPLACE THE NAMES BELOW WITH YOUR ACTUAL 41 MEMBER NAMES !!!
    const memberNames = [
"Srinikethan",
  "Sundharesan",
  "Royden Jerome S",
  "Ramkumar A",
  "Rohith R V",
  "Sarathi S",
  "Tejaswini Srinivasan",
  "Shyamsreesh Anand",
  "Kamali B",
  "Nivetha Senthilkumar",
  "S. Vidhya Shree",
  "Balamurugan C",
  "Dhanasri Ashokraj",
  "Sowmiyaa BGM",
  "Carewin Rachel B",
  "Thilaikarasi D",
  "Baumendhra",
  "Harikishore S",
  "Nidthish S",
  "Varsha Varrdhini N",
  "Meenakshi V",
  "Sri Vishnu S",
  "L. Nithyakavi",
  "Bharathi S P",
  "Naveen R",
  "Navin M",
  "Yuva Preethi",
  "L. Maha Swetha",
  "Mathishwaran R A",
  "Sheeba Immancy A",
  "Niyas Ahamed N",
  "M. Adithya Natarajan",
  "G. Kanishka",
  "Vivin Raj V",
  "M. Sivaprakash",
  "Manasa",
  "Vignesh Rahul M",
  "Joahua Tony A",
  "Ramya Devi P T",
  "Kaleeshwari",
  "Jayasree N", // The 41st member
        // Make sure you have exactly 41 names here.
    ];

    // --- State Variables ---
    let allMembers = [];           // Holds all member objects {id, name, isGolden?}
    let availableMembers = [];     // Shuffled list of members yet to be drawn
    let currentTeam = [];          // Members drawn for the team currently being formed
    let completedTeams = [];       // Array of completed team objects
    let teamCounter = 0;           // Counter for team IDs
    let isDrawing = false;         // Flag to prevent multiple draws during animation

    // --- Optional Features Data ---
    const teamNamePrefixes = [
        "Silent",
        "Shadow",
        "Stealthy",
        "Dark",
        "Crimson",
        "Iron",
        "Swift",
        "Ghost",
        "Mystic",
        "Blazing"
      ];
    const teamNameSuffixes = [
        "Ninjas",
        "Hackers",
        "Samurais",
        "Warriors",
        "Shurikens",
        "Blades",
        "Assassins",
        "Shadows",
        "Snipers",
        "Masters"
      ];

    // --- Initialization ---
    function init() {
        createMembers(); // Create members using the provided names list
        shuffleAndRestart(); // Shuffle and set up the initial state
    }

    // --- Create Member Objects ---
    // *** This function now uses the memberNames array ***
    function createMembers() {
        allMembers = []; // Clear previous members if any

        // Check if the correct number of names is provided
        if (memberNames.length !== TOTAL_MEMBERS) {
            console.warn(`Warning: Expected ${TOTAL_MEMBERS} names, but received ${memberNames.length}. Using the ${memberNames.length} names provided.`);
            alert(`Warning: Expected ${TOTAL_MEMBERS} names, but received ${memberNames.length}. Please update the list in script.js.`);
        }

        // Use the provided names array to create member objects
        const count = Math.min(memberNames.length, TOTAL_MEMBERS); // Use the smaller count to avoid errors
        for (let i = 0; i < count; i++) {
            allMembers.push({
                id: i + 1,             // Assign sequential IDs (1 up to 41)
                name: memberNames[i],  // Use the name from your list
                isGolden: false        // Initialize isGolden to false
            });
        }

        // Assign Golden Card status based on ID
        if (GOLDEN_CARD_ID > 0 && GOLDEN_CARD_ID <= allMembers.length) {
            const goldenMemberIndex = allMembers.findIndex(m => m.id === GOLDEN_CARD_ID);
            if (goldenMemberIndex !== -1) {
               allMembers[goldenMemberIndex].isGolden = true;
               console.log(`Golden Card assigned to: ID ${GOLDEN_CARD_ID}, Name: ${allMembers[goldenMemberIndex].name}`);
            } else {
                 // Should not happen if ID is valid, but good to check
                 console.warn(`Could not find member with ID ${GOLDEN_CARD_ID} internally, though ID seems valid.`);
            }
        } else if (GOLDEN_CARD_ID > 0) {
             console.warn(`Golden Card ID ${GOLDEN_CARD_ID} is out of range (1-${allMembers.length}). No golden card assigned.`);
        }
    }

    // --- Core Logic ---

    // Fisher-Yates (Knuth) Shuffle Algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    // Reset and Shuffle
    function shuffleAndRestart() {
        if (!allMembers || allMembers.length === 0) {
            console.error("Cannot restart: Member list is empty or not initialized.");
            alert("Error: Member list is empty. Please check the names in script.js.");
            return;
        }
        availableMembers = [...allMembers]; // Create a fresh copy
        shuffleArray(availableMembers);
        currentTeam = [];
        completedTeams = [];
        teamCounter = 0;
        isDrawing = false;

        // Reset UI
        currentDrawContainer.innerHTML = '';
        teamsContainer.innerHTML = '';
        drawButton.disabled = false;
        exportButton.style.display = 'none'; // Hide export button
        updateMembersLeftCount();
        console.log("Deck shuffled and ready!");
    }

    // Draw a Single Card
    function drawCard() {
        if (isDrawing || availableMembers.length === 0) {
            return; // Exit if already drawing or no members left
        }

        isDrawing = true;
        drawButton.disabled = true; // Disable button during draw/animation

        const drawnMember = availableMembers.pop(); // Get the next member
        currentTeam.push(drawnMember);
        updateMembersLeftCount();

        displayDrawnCard(drawnMember); // Create and animate the card visually

        // Play sound after a short delay to sync with animation start
        setTimeout(() => {
            playSound(cardFlipSound);
        }, 100); // Adjust timing as needed

        // Handle timing after animation completes
        const animationDuration = 600; // Corresponds to --animation-speed in CSS
        setTimeout(() => {
            checkTeamFormation(); // Check if a team is complete
            isDrawing = false; // Re-enable drawing logic after animation/check

            // Re-enable draw button ONLY if there are more members left
             if (availableMembers.length > 0) {
                 drawButton.disabled = false;
             } else {
                 console.log("All members have been drawn!");
                 exportButton.style.display = 'inline-block'; // Show export button now
             }
        }, animationDuration + 50); // Add a small buffer for safety
    }

    // Create and Animate the Drawn Card in the UI
    function displayDrawnCard(member) {
        const card = document.createElement('div');
        card.classList.add('card', 'hidden'); // Start hidden for flip animation
        card.dataset.memberId = member.id;

        const memberIdSpan = document.createElement('span');
        memberIdSpan.classList.add('member-id');
        memberIdSpan.textContent = member.id;

        const memberNameSpan = document.createElement('span');
        memberNameSpan.classList.add('member-name');
        memberNameSpan.textContent = member.name; // Display the actual name

        card.appendChild(memberIdSpan);
        card.appendChild(memberNameSpan);

        // Apply Golden Card style if applicable
        if (member.isGolden) {
            card.classList.add('golden');
            console.log(`✨ Golden Card Drawn: ${member.name}! ✨`);
            // Add a temporary glow animation
             card.classList.add('glow-animation');
             setTimeout(() => card.classList.remove('glow-animation'), 2000); // Remove glow after 2s
        }

        currentDrawContainer.appendChild(card);

        // Force browser reflow before adding animation class (ensures transition runs)
        void card.offsetWidth;

        // Trigger the flip animation by removing 'hidden' and adding 'drawn'
        card.classList.remove('hidden');
        card.classList.add('drawn');
    }

    // Check if the Current Team is Complete
    function checkTeamFormation() {
        let formTheTeam = false;

        // Condition 1: Team reaches standard size (4)
        if (currentTeam.length === TEAM_SIZE) {
            // Form the team if no members are left OR if enough members remain for at least one more standard team
            if (availableMembers.length === 0 || availableMembers.length >= TEAM_SIZE) {
                 formTheTeam = true;
            }
            // Otherwise (1, 2, or 3 members left), wait for the next draw(s) to form the final larger team
        }
        // Condition 2: No members left to draw, form the final team with whoever is in currentTeam
        else if (availableMembers.length === 0 && currentTeam.length > 0) {
             formTheTeam = true; // Form the last team (might have 1 to 5 members)
        }

        // If conditions met, form and display the team
        if (formTheTeam) {
            teamCounter++;
            const newTeam = [...currentTeam]; // Copy the members
            completedTeams.push({
                id: teamCounter,
                name: generateTeamName(),   // Generate a fun name
                members: newTeam,
                color: getRandomColor()    // Assign a random background color
            });

            displayCompletedTeam(completedTeams[completedTeams.length - 1]); // Show the team card

            // Trigger confetti and sound
            triggerConfetti();
            playSound(teamCompleteSound);

            // Clear the current drawing area for the next team
            currentTeam = [];
            currentDrawContainer.innerHTML = '';

            // Final check if all members are assigned after forming this team
            if (availableMembers.length === 0) {
                drawButton.disabled = true; // Disable draw button permanently
                if (!exportButton.style.display || exportButton.style.display === 'none') {
                    exportButton.style.display = 'inline-block'; // Ensure export button is visible
                }
            }
        }
    }

    // Display a Completed Team in its Own Card
    function displayCompletedTeam(team) {
        const teamCard = document.createElement('div');
        teamCard.classList.add('team-card');
        teamCard.style.backgroundColor = team.color; // Apply random color

        const teamTitle = document.createElement('h3');
        teamTitle.textContent = `Team ${team.id}`;

        const teamNameHeader = document.createElement('h4');
        teamNameHeader.textContent = team.name || "Unnamed Team"; // Display generated name

        const memberList = document.createElement('ul');
        team.members.forEach(member => {
            const memberItem = document.createElement('li');
            // Display member ID and Name
            memberItem.textContent = `${member.id}. ${member.name}`;
            // Highlight golden members within the team list
             if (member.isGolden) {
                 memberItem.style.fontWeight = 'bold';
                 memberItem.style.border = '1px solid gold';
                 memberItem.style.backgroundColor = 'rgba(255, 215, 0, 0.3)'; // Light gold highlight
             }
            memberList.appendChild(memberItem);
        });

        teamCard.appendChild(teamTitle);
        teamCard.appendChild(teamNameHeader); // Add team name below title
        teamCard.appendChild(memberList);
        teamsContainer.appendChild(teamCard); // Add the card to the teams area
    }

    // Update the 'Members Left' Counter
    function updateMembersLeftCount() {
        membersLeftSpan.textContent = availableMembers.length;
    }

    // --- Helper Functions & Add-ons ---

    // Play Audio Element Safely
    function playSound(audioElement) {
        if (audioElement && typeof audioElement.play === 'function') {
             audioElement.currentTime = 0; // Rewind to start
             audioElement.play().catch(error => {
                 // Autoplay might be blocked by the browser initially
                 console.warn("Audio play prevented:", error);
                 // You could potentially show a message asking the user to interact first
             });
        } else {
            console.warn("Audio element not found or invalid:", audioElement);
        }
    }

    // Trigger Confetti Animation
    function triggerConfetti() {
         // Check if the confetti library is loaded (from the CDN in index.html)
         if (typeof confetti === 'function') {
             confetti({
                 particleCount: 120, // Number of confetti pieces
                 spread: 80,        // How far they spread horizontally
                 origin: { y: 0.6 } // Starting point (0 = top, 1 = bottom)
             });
         } else {
             console.log("🎉 Team Complete! (Confetti library not available)");
         }
    }

    // Generate a Random Pleasant Color (HSL format)
    function getRandomColor() {
        const hue = Math.floor(Math.random() * 360); // Angle on the color wheel (0-359)
        const saturation = Math.floor(Math.random() * 30) + 70; // 70-100% (controls vibrancy)
        const lightness = Math.floor(Math.random() * 20) + 60;  // 60-80% (controls brightness/darkness)
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    // Generate a Random Team Name
    function generateTeamName() {
        const prefix = teamNamePrefixes[Math.floor(Math.random() * teamNamePrefixes.length)];
        const suffix = teamNameSuffixes[Math.floor(Math.random() * teamNameSuffixes.length)];
        return `${prefix} ${suffix}`;
    }

    // Export Team List as a Text File
    function exportTeams() {
        if (completedTeams.length === 0) {
            alert("No teams have been formed yet!");
            return;
        }

        let exportText = "Team Assignments\n";
        exportText += `Generated on: ${new Date().toLocaleString()}\n`; // Add timestamp
        exportText += "================\n\n";

        completedTeams.forEach(team => {
            exportText += `Team ${team.id} (${team.name || 'Unnamed'}):\n`;
            team.members.forEach(member => {
                exportText += `- ${member.id}. ${member.name} ${member.isGolden ? '(✨)' : ''}\n`; // Indicate golden card
            });
            exportText += "\n"; // Add space between teams
        });

        // Create a Blob (Binary Large Object) and trigger download
        try {
            const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob); // Create a temporary URL for the blob
            link.download = 'team_assignments.txt'; // Suggested filename for download
            link.style.display = 'none'; // Hide the link element
            document.body.appendChild(link); // Add link to the DOM to make it clickable
            link.click(); // Programmatically click the link to trigger download
            document.body.removeChild(link); // Remove the link from the DOM
            URL.revokeObjectURL(link.href); // Clean up the temporary URL
        } catch (error) {
            console.error("Error exporting teams:", error);
            alert("Sorry, there was an error exporting the teams.");
        }
    }

    // --- Event Listeners ---
    drawButton.addEventListener('click', drawCard);
    restartButton.addEventListener('click', shuffleAndRestart);
    exportButton.addEventListener('click', exportTeams);

    // --- Start the application ---
    init(); // Initialize the app when the DOM is fully loaded
});