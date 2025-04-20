<?php
session_start();
include('db.php'); // Include the database connection
include('header.php'); // Include the stylesheet

$user_id = $_SESSION['user_id']; 

// Query to get polls that the user has voted on and with voting time
$query = "
    SELECT polls.*, votes.created_at AS vote_time 
    FROM polls 
    JOIN votes ON polls.id = votes.poll_id 
    WHERE votes.user_id = '$user_id' 
    ORDER BY votes.created_at ASC 
"; // Order by the time of voting, latest at the bottom

$result = mysqli_query($conn, $query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voted Polls</title>
</head>
<body>
    <h2>Voted Polls</h2>
    <table border="1">
        <tr>
            <th>Poll Question</th>
            <th>Vote Time</th> 
            <th>Actions</th>
        </tr>
        <?php while ($poll = mysqli_fetch_assoc($result)): ?>
        <tr>
            <td><?php echo htmlspecialchars($poll['question']); ?></td>
            <td><?php echo date('Y-m-d H:i', strtotime($poll['vote_time'])); ?></td> 
            <td>
                <a href="view_poll.php?poll_id=<?php echo $poll['id']; ?>">View Results</a>
            </td>
        </tr>
        <?php endwhile; ?>
    </table>

    <a href="polls.php"> <input type="button" class="styled-button" value="Back to All Polls"> </a>
    <a href="dashboard.php"> <input type="button" class="styled-button" value="Back to Dashboard"> </a>

</body>
</html>