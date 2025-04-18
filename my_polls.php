<?php
session_start();
include('db.php'); // database connection
include('header.php');

$user_id = $_SESSION['user_id']; 

// Query to retrieve polls created by the user
$query = "SELECT * FROM polls WHERE user_id = '$user_id'";
$result = mysqli_query($conn, $query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Polls</title>
</head>
<body>
    <h2>My Polls</h2>
    <table border="1">
        <tr>
            <th>Poll Question</th>
            <th>Actions</th>
        </tr>
        <?php while ($poll = mysqli_fetch_assoc($result)): ?>
        <tr>
            <td><?php echo htmlspecialchars($poll['question']); ?></td>
            <td>
                <a href="view_poll.php?poll_id=<?php echo $poll['id']; ?>">View</a> | 
                <a href="edit_poll.php?poll_id=<?php echo $poll['id']; ?>">Edit</a> | 
                <a href="delete_poll.php?poll_id=<?php echo $poll['id']; ?>">Delete</a>
            </td>
        </tr>
        <?php endwhile; ?>
    </table>

    <a href="dashboard.php"> <input type = "button" class="styled-button" value = "Back to Dashboard"></a>
    <a href="polls.php"> <input type = "button" class="styled-button" value = "Back to All Polls"></a>
    
</body>
</html>