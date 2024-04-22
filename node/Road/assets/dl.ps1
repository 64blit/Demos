# Specify your bucket and folder
$bucketName = "kmw-training"
$folderPath = "incident/accident/"
$localDirectory = "./accidents"
$numberOfFilesToDownload = 25  # Set the number of random files you want to download

# Ensure local directory exists
if (-not (Test-Path $localDirectory)) {
    New-Item -ItemType Directory -Path $localDirectory
}

# List all objects in the specified S3 folder and extract the keys
$objectKeys = aws s3 ls s3://$bucketName/$folderPath --recursive | ForEach-Object { $_ -split '\s+' | Select-Object -Last 1 }

# Select random files from the list
$randomKeys = Get-Random -InputObject $objectKeys -Count $numberOfFilesToDownload

# Download each selected file
foreach ($key in $randomKeys) {
    $fileName = $key -split '/' | Select-Object -Last 1
    $localFilePath = Join-Path -Path $localDirectory -ChildPath $fileName
    $s3Path = "s3://$bucketName/$key"
    aws s3 cp $s3Path $localFilePath
    Write-Host "Downloaded: $fileName to $localFilePath"
}

Write-Host "Download complete."
