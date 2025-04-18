<?php
session_start();
include('db.php'); // Include database connection
include('header.php');

// Check if poll_id is set in the URL
if (!isset($_GET['poll_id'])) {
    header("Location: my_polls.php");
    exit();
}

$poll_id = $_GET['poll_id'];

// Fetch the poll details
$query = "SELECT * FROM polls WHERE id = '$poll_id'";
$result = mysqli_query($conn, $query);
$poll = mysqli_fetch_assoc($result);

// Update poll if form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $question = $_POST['question'];
    // Update the poll in the database
    $update_query = "UPDATE polls SET question = '$question' WHERE id = '$poll_id'";
    if (mysqli_query($conn, $update_query)) {
        echo "Poll updated successfully!";
        header("Location: my_polls.php"); // Redirect to my polls page
        exit();
    } else {
        echo "Error updating poll: " . mysqli_error($conn);
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Poll</title>
</head>
<body>
    <h2>Edit Poll</h2>
    <form action="edit_poll.php?poll_id=<?php echo $poll_id; ?>" method="POST">
        <label for="question">Poll Question:</label><br>
        <input type="text" name="question" value="<?php echo htmlspecialchars($poll['question']); ?>" required>
        <br><br>
        <input type="submit" class="styled-button" value="Update Poll">
    </form>
    <a href="my_polls.php" title = "Go back to my polls">Cancel</a>
</body>
</html>