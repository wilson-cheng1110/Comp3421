<?php
session_start();
include('db.php');
include('header.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $login_id = $_POST['login_id'];
    $password = $_POST['password'];

    $query = "SELECT * FROM users WHERE login_id='$login_id'";
    $result = mysqli_query($conn, $query);
    
    // Get user data
    $user = mysqli_fetch_assoc($result);

    // Check if user exists and password is correct
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id']; // set session variable
        $_SESSION['nickname'] = $user['nickname']; // store the nickname

        // cookieee
        setcookie("login_id", $login_id, time() + (86400 * 30)); // 30 days, rmb user's login status

        // Redirect to dashboard.php after successful login
        header("Location: dashboard.php");
        exit();
    } else {
        echo "Invalid login credentials.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Login</title>
</head>
<body>
    <h2>User Login</h2>
    <form action="login.php" method="POST">
        <label for="login_id">Login ID:</label>
        <input type="text" name="login_id" required><br>

        <label for="password">Password:</label>
        <input type="password" name="password" required><br>

        <input type="submit" class="styled-button" value="Login">
        <a href="register.php"> <input type = "button" class="styled-button" value = "Register"> </a>
    </form>
</body>
</html>