<?php
session_start();
include('header.php');
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    // Include database connection and header file
    include('db.php');

    // Collect form data
    $login_id = $_POST['login_id'];
    $nickname = $_POST['nickname'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    // Handle file upload for profile_image
    $profile_image = $_FILES['profile_image']['name'];
    $target = "uploads/" . basename($profile_image);

    // Create uploads directory if it doesn't exist
    if (!is_dir('uploads')) {
        mkdir('uploads', 0777, true); // Create the directory with appropriate permissions
    }

    // Move the uploaded file
    if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $target)) {
        // Insert user data into the database
        $query = "INSERT INTO users (login_id, nickname, email, password, profile_image) VALUES ('$login_id', '$nickname', '$email', '$password', '$profile_image')";
        
        if (mysqli_query($conn, $query)) {
            // Redirect to login page after successful registration
            header("Location: login.php");
            exit();
        } else {
            echo "Error: " . mysqli_error($conn);
        }
    } else {
        echo "Failed to upload image.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Registration</title>
</head>
<body>
    <h2>User Registration</h2>
    <form action="register.php" method="POST" enctype="multipart/form-data">
        <label for="login_id">Login ID:</label>
        <input type="text" name="login_id" required><br>

        <label for="nickname">Nickname:</label>
        <input type="text" name="nickname" required><br>

        <label for="email">Email:</label>
        <input type="email" name="email" required><br>

        <label for="password">Password:</label>
        <input type="password" name="password" required><br>

        <label for="profile_image">Profile Image:</label>
        <input type="file"  name="profile_image" accept="image/*"><br>

        <input type="submit" class="styled-button" value="Register">
        <a href="login.php"> <input type = "button" class="styled-button" value = "Login Page"> </a>
    </form>
</body>
</html>