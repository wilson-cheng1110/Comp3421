<?php
session_start();
include('db.php'); // Database connection start
include('header.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $question = $_POST['question'];
    $options = explode(',', $_POST['options']);

    // Check if user_id is set in the session
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];

        // Insert poll into the database
        $query = "INSERT INTO polls (question, user_id) VALUES ('$question', '$user_id')";
        if (mysqli_query($conn, $query)) {
            $poll_id = mysqli_insert_id($conn); // Get the last inserted ID

            // Insert each option into the Options table
            foreach ($options as $option) {
                $option = trim($option); // Clean up options
                $query = "INSERT INTO options (poll_id, option_text) VALUES ('$poll_id', '$option')";
                mysqli_query($conn, $query);
            }

            echo "Poll created successfully!";
        } else {
            echo "Error creating poll: " . mysqli_error($conn);
        }
    } else {
        echo "User not logged in!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Poll</title>
</head>
<body>
    <h2>Create Poll</h2>
    <form action="create_poll.php" method="POST">
        <label for="question">Poll Question:</label><br>
        <input type="text" name="question" required><br><br>

        <label for="options">Poll Options (separate with commas):</label><br>
        <input type="text" name="options" required placeholder="Option 1, Option 2, Option 3"><br><br>

        <input type="submit" class="styled-button" value="Create Poll">
        <a href="dashboard.php"> <input type = "button" class="styled-button" value = "Back to Dashboard"> </a>
    </form>
</body>
</html>