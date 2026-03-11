const verificationLoginTemplate = (verificationUrl) => {

    return `

<html>

<head>
<style>

.container{
font-family: Arial;
padding:20px;
text-align:center;
}

.button{
background:#28a745;
padding:12px 25px;
color:white;
text-decoration:none;
border-radius:5px;
font-size:16px;
}

</style>
</head>


<body>

<div class="container">
 
    <h2>Login Verification</h2>
    <p>Please click below button to verify your login</p>
    <a href="${verificationUrl}">
    <button style="padding:10px 20px;background:#4CAF50;color:white;border:none;">
    Verify Login
    </button>
    </a>
    

</body>
</html>
`;

};

module.exports = verificationLoginTemplate;