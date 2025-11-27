# Test script to create a product
$body = @{
    name = "Test Product"
    price = "99.99"
    description = "Test description"
    imageUrl = "https://via.placeholder.com/500"
    stock = "10"
}

# Create form data manually
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @()
foreach ($key in $body.Keys) {
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"$key`""
    $bodyLines += ""
    $bodyLines += $body[$key]
}
$bodyLines += "--$boundary--"
$bodyString = $bodyLines -join $LF

$headers = @{
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/products" `
        -Method POST `
        -Body $bodyString `
        -Headers $headers `
        -SessionVariable session `
        -UseBasicParsing
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Error!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Message: $($_.Exception.Message)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response Body: $responseBody"
}
