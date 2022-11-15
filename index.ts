import * as dotenv from 'dotenv';
import  {runServer} from './src/main'
import express from "express";
import http from "http";

dotenv.config();

runServer();