<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $request->headers->set("Access-Control-Allow-Origin", "*");
        $request->headers->set("Access-Control-Allow-Methods", "POST, PUT, GET, DELETE, PATCH, OPTIONS");
        $request->headers->set("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, X-Requested-With");

        return $response;
    }
}
