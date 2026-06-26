<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Users</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(to bottom, #f9f9f9, #e6e6e6);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            max-width: 900px;
            width: 90%;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .heading {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            overflow: hidden;
        }

        table,
        th,
        td {
            border: 1px solid #ddd;
        }

        th {
            background-color: #4CAF50;
            color: white;
            text-align: center;
            padding: 12px;
        }

        td {
            text-align: center;
            padding: 10px;
            color: #555;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        tr:hover {
            background-color: #f1f1f1;
        }

        .edit-btn {
            display: inline-block;
            padding: 8px 15px;
            background-color: #007BFF;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 14px;
            transition: background-color 0.3s ease;
        }

        .edit-btn:hover {
            background-color: rgb(36, 0, 179);
        }

       /* Back Button */
.back-btn {
    display: inline-block;
    padding: 8px 15px;
    background-color: rgb(18, 217, 28);
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-size: 14px;
    margin-top: 20px;
    transition: background-color 0.3s ease;
}

.back-btn:hover {
    background-color: rgb(22, 218, 91);
}

/* Align the back button to the right side of the container */
.container {
    max-width: 900px;
    width: 90%;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
}

/* Add this rule to push the back button to the right */
.container .back-btn {
    margin-top: 20px; /* Space from the top */
    margin-left: auto; /* Aligns the back button to the right */
}

    </style>
</head>

<body>
    <div class="container">
        <h2 class="heading">User Details</h2>
        <?php
        // Database connection details
        $servername = "localhost";
        $username = "root"; // Replace with your database username
        $password = "Hbl@1234"; // Replace with your database password
        $dbname = "loco_info"; // Replace with your database name

        // Create a connection
        $conn = new mysqli($servername, $username, $password, $dbname);

        // Check the connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        // Query to fetch user details
        $sql = "SELECT id, employee_name, phone_number, username FROM loginpage";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            echo "<table>";
            echo "<tr><th>ID</th><th>Employee Name</th><th>Phone Number</th><th>Username</th><th>Action</th></tr>";
            // Output data for each row
            while ($row = $result->fetch_assoc()) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($row['id']) . "</td>";
                echo "<td>" . htmlspecialchars($row['employee_name']) . "</td>";
                echo "<td>" . htmlspecialchars($row['phone_number']) . "</td>";
                echo "<td>" . htmlspecialchars($row['username']) . "</td>";
                echo "<td><a class='edit-btn' href='edit_user.php?id=" . htmlspecialchars($row['id']) . "'>Edit</a></td>";
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<p>No users found.</p>";
        }

        // Close the connection
        $conn->close();
        ?>

        <!-- Back Button -->
        <a class="back-btn" href="create_user.html">Back</a>
    </div>
</body>

</html>