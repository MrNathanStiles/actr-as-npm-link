param (
    [string]$local
)
clear
$apiKey = "PUT YOUR API KEY HERE"

if ($local -eq "local") {
    $server = "https://localhost:7086/api/Wasm/Upload/81pnshodoodpzjlqg6nv78mt79k3ezzks1i7b6i4vdycpulq7o"
}
else {
    $server = "https://www.d1ag0n.com/api/Wasm/Upload/"
}
    
npx asc ./assembly/index.ts

if ($LastExitCode -eq 0) {
    if ($local -eq "local") {
        curl -k --fail -F "file=@./build/release.wasm" $server
    } else {
        curl --fail -F "file=@./build/release.wasm" $server + $apiKey
    }
    Remove-Item -Force:$true -Confirm:$false -Recurse:$true ./build
} else {
    Write-Output "build failed"
}

if ($LastExitCode -eq 0) {
    Write-Output "$script.wasm uploaded to $server"
} 
