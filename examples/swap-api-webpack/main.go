package main

import (
    "flag"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
)

var hostname string
var port int

func main() {
    // flags declaration using flag package
    // flag.StringVar(&hostname, "H", "https://rpc-cosmoshub.keplr.app", "Specify hostname")
		flag.StringVar(&hostname, "H", "https://rpc.cosmos.network", "Specify hostname")
    flag.IntVar(&port, "p", 8081, "Specify port")

    flag.Parse() // after declaring flags we
    http.HandleFunc("/", serveCorsProxy)
    log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

// Serve a reverse proxy for a given url
func serveCorsProxy(res http.ResponseWriter, req *http.Request) {
    proxyRequest, err := http.NewRequest(req.Method, hostname, req.Body)
    proxyRequest.URL.Path = req.URL.Path
    proxyRequest.URL.RawQuery = req.URL.RawQuery
    if err != nil {
        fmt.Printf("create request error: %v", err)
        return
    }
    response, err := http.DefaultClient.Do(proxyRequest)
    if err != nil {
        fmt.Printf("proxy request error: %v", err)
        return
    }
    setHeaders(response, &res)
    body, err := ioutil.ReadAll(response.Body)
    if err != nil {
        fmt.Printf("response read error: %v", err)
        return
    }
		fmt.Printf("Running...")
    res.WriteHeader(response.StatusCode)
    _, _ = res.Write(body)
}

func setHeaders(src *http.Response, dest *http.ResponseWriter) {
    header := (*dest).Header()
    for name, values := range (*src).Header {
        for _, value := range values {
            header.Set(name, value)
        }
    }
    header.Set("access-control-allow-headers", "Accept,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With")
    header.Set("access-control-allow-methods", "GET, POST, OPTIONS")
    header.Set("access-control-allow-origin", "http://localhost:3001")
    header.Set("access-control-expose-headers", "Content-Length,Content-Range")
    header.Set("access-control-max-age", "1728000")
}
