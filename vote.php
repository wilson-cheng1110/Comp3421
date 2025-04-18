<?php
session_start();
include('db.php'); // Include the database connection
include('header.php'); // Include the stylesheet

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo "You need to log in to vote.";
    exit;
}

// Initialize poll_id and check if it's set in GET request
$poll_id = isset($_GET['poll_id']) ? $_GET['poll_id'] : null;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Check if poll_id and option_id are set in POST request
    if (isset($_POST['poll_id']) && isset($_POST['option_id'])) {

        $poll_id = $_POST['poll_id']; // Get the poll ID
        $option_id = $_POST['option_id']; // Get the selected option ID
        $user_id = $_SESSION['user_id']; // Get the user ID from session

        // Insert the vote into the Votes table
        $query = "INSERT INTO votes (poll_id, user_id, option_id) VALUES ('$poll_id', '$user_id', '$option_id')";
        if (mysqli_query($conn, $query)) {

            // Go to vote_confirmation.php after vote
            header("Location: vote_confirmation.php?poll_id=" . urlencode($poll_id));
            exit(); 

        } else {
            echo "Error: " . mysqli_error($conn);
        }
        
    } else {
        echo "Poll ID or Option ID is missing.";
    }
}

// Fetch the poll options to display
if ($poll_id) {
    $query = "SELECT * FROM options WHERE poll_id = '$poll_id'";
    $options_result = mysqli_query($conn, $query);
} else {
    echo "Poll ID is not set.";
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vote</title>
</head>
<body>
    <h2>Vote for Poll</h2>
    <form action="vote.php?poll_id=<?php echo $poll_id; ?>" method="POST">
        <input type="hidden" name="poll_id" value="<?php echo $poll_id; ?>">
        <?php while ($option = mysqli_fetch_assoc($options_result)): ?>
            <input type="radio" name="option_id" value="<?php echo $option['id']; ?>" required>
            <?php echo htmlspecialchars($option['option_text']); ?><br>
        <?php endwhile; ?>
        <input type="submit" class="styled-button" value="Submit Vote">
    </form>
</body>
</html>