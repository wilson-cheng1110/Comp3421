<?php
session_start();
include('db.php'); // DB connection
include('header.php'); // Style

// Query to retrieve all polls
$query = "SELECT * FROM polls";
$result = mysqli_query($conn, $query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Polls List</title>
</head>
<body>
    <h2>Polls List</h2>
    <table border="1">
        <tr>
            <th>Poll Question</th>
            <th>Actions</th>
        </tr>
        <?php while ($poll = mysqli_fetch_assoc($result)): ?>
        <tr>
            <td><?php echo htmlspecialchars($poll['question']); ?></td>
            <td>
                <a href="vote.php?poll_id=<?php echo $poll['id']; ?>">Vote</a> | 
                <a href="view_poll.php?poll_id=<?php echo $poll['id']; ?>">View</a>
            </td>
        </tr>
        <?php endwhile; ?>
    </table>
    
    <a href="dashboard.php"> <input type = "button" class="styled-button" value = "Back to Dashboard"> </a>
</body>
</html>