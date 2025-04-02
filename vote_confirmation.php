<?php
session_start();
include('db.php'); // Include the database connection
include('header.php'); // Include the stylesheet

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo "You need to log in to vote.";
    exit;
}

// Get the poll_id from the URL
$poll_id = isset($_GET['poll_id']) ? $_GET['poll_id'] : null;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vote Confirmation</title>
</head>
<body>
    <h2>Thank You for Voting!</h2>
    <p>Your vote has been recorded successfully.</p>
    <form action="dashboard.php" method="GET">
        <input type="submit" class="styled-button" value="Go Back to Dashboard">
    </form>
    <form action="voted_polls.php?poll_id=<?php echo $poll_id; ?>" method="GET">
        <input type="submit" class="styled-button" value="View Voted Poll Results">
    </form>
</body>
</html>