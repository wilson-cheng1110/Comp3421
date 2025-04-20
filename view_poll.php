<?php
session_start();
include('db.php'); // Include the database connection
include('header.php'); // Include the stylesheet

// Check if poll_id is set in the URL
if (!isset($_GET['poll_id'])) {
    echo "Poll ID is missing. Please go back to the polls page.";
    exit;
}

// Get the poll ID from the URL
$poll_id = $_GET['poll_id'];

// Query to get the poll question
$poll_query = "SELECT * FROM polls WHERE id = '$poll_id'";
$poll_result = mysqli_query($conn, $poll_query);

// Check if the poll exists
if (mysqli_num_rows($poll_result) == 0) {
    echo "Poll not found.";
    exit;
}

$poll = mysqli_fetch_assoc($poll_result);

// Query to get the options and their vote counts
$options_query = "
    SELECT options.*, COUNT(votes.id) AS vote_count 
    FROM options 
    LEFT JOIN votes ON options.id = votes.option_id 
    WHERE options.poll_id = '$poll_id' 
    GROUP BY options.id
";
$options_result = mysqli_query($conn, $options_query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Poll</title>
</head>
<body>
    <h2><?php echo htmlspecialchars($poll['question']); ?></h2>
    <h3>Options:</h3>
    <ul>
        <?php while ($option = mysqli_fetch_assoc($options_result)): ?>
            <li>
                <?php echo htmlspecialchars($option['option_text']); ?> - Votes: <?php echo $option['vote_count']; ?>
            </li>
        <?php endwhile; ?>
    </ul>
    <a href="voted_polls.php"> <input type = "Button" class="styled-button" value = "Back to My Voted Polls"></a>
    <a href="dashboard.php"> <input type = "button" class="styled-button" value = "Back to Dashboard"> </a>
</body>
</html>