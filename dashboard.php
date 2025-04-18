<?php
session_start();
include('header.php');

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        /*nav {
            margin: 20px 0;
        }
        nav a {
            margin: 0 15px;
            text-decoration: none;
            color: #007BFF;
        }
        nav a:hover {
            text-decoration: underline;
        } */
    </style>

</head>
<body>
    <h1>This is the voting system </h1>
    <h4>Welcome to Your Dashboard</h4>
    <p>Hello, <?php echo $_SESSION['nickname']; ?>!</p> 


    <!-- Links -->
    <nav>
        <a href="create_poll.php"> <input type = "button" class="styled-button" value = "Create a New Poll"></a>
        <a href="polls.php"> <input type = "button" class="styled-button" value = "All Polls"></a>
        <a href="my_polls.php"> <input type = "button" class="styled-button" value = "My Polls"></a>
        <a href="voted_polls.php"> <input type = "button" class="styled-button" value = "My Voted Poll"></a>
        <a href="logout.php"> <input type = "button" class="styled-button" value = "Logout"></a>

    </nav>

</body>
</html>