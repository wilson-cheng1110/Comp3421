<?php
session_start();
include('db.php'); // database connection
include('header.php');

// Check if poll_id is set in the URL
if (!isset($_GET['poll_id'])) {
    header("Location: my_polls.php");
    exit();
}

$poll_id = $_GET['poll_id'];

// Start a transaction
mysqli_begin_transaction($conn);

try {
    // Delete all votes associated with the poll
    $delete_votes_query = "DELETE FROM votes WHERE poll_id = '$poll_id'";
    mysqli_query($conn, $delete_votes_query);

    // Delete all options associated with the poll
    $delete_options_query = "DELETE FROM options WHERE poll_id = '$poll_id'";
    mysqli_query($conn, $delete_options_query);

    // Now delete the poll
    $delete_poll_query = "DELETE FROM polls WHERE id = '$poll_id'";
    if (mysqli_query($conn, $delete_poll_query)) {
        // Commit the transaction
        mysqli_commit($conn);
        echo "Poll deleted successfully!";
    } else {
        throw new Exception("Error deleting poll: " . mysqli_error($conn));
    }
} catch (Exception $e) {
    // Rollback the transaction on error
    mysqli_rollback($conn);
    echo $e->getMessage();
}

// Redirect to My Polls page after deletion
header("Location: my_polls.php");
exit();
?>