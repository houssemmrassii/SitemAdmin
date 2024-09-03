import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import './Dashboard.scss';
import { color } from 'framer-motion';
import { red } from '@mui/material/colors';

interface Command {
  deliveryAddress: string;
  deliveryCost: number;
  deliveryManId: string;
  discount: number;
  finalTotal: number;
  id: string;
  items: any[];
  paymentMethod: string;
  status: string;
  tip: number;
}

interface Restaurant {
  name: string;
  address: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [commandData, setCommandData] = useState<Command[]>([]);
  const [restaurantData, setRestaurantData] = useState<Restaurant[]>([]);
  const [topMetrics, setTopMetrics] = useState({
    totalCommands: 0,
    totalRevenue: 0,
    totalDiscounts: 0,
    averageTip: 0,
  });
  const [pieChartData, setPieChartData] = useState([
    { name: 'En cours', value: 0, color: '#4CAF50' }, // Green
    { name: 'En attente', value: 0, color: '#BDBDBD' }, // Gray
  ]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchCommands = async () => {
      const commandCollection = collection(db, 'command');
      const commandSnapshot = await getDocs(commandCollection);
      const commandList = commandSnapshot.docs.map(doc => doc.data() as Command);

      // Update commands that don't have a status to 'En attente'
      const updatedCommands = commandList.map(command => ({
        ...command,
        status: command.status ? command.status : 'En attente',
      }));

      setCommandData(updatedCommands);

      const totalRevenue = updatedCommands.reduce((sum: number, command: Command) => sum + (command.finalTotal || 0), 0);
      const totalDiscounts = updatedCommands.reduce((sum: number, command: Command) => sum + (command.discount || 0), 0);
      const totalCommands = updatedCommands.length;
      const averageTip = totalCommands > 0 
        ? updatedCommands.reduce((sum: number, command: Command) => sum + (command.tip || 0), 0) / totalCommands 
        : 0;

      setTopMetrics({
        totalCommands,
        totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
        totalDiscounts: isNaN(totalDiscounts) ? 0 : totalDiscounts,
        averageTip: isNaN(averageTip) ? 0 : averageTip,
      });

      // Calculate pie chart data based on command statuses
      const enCours = updatedCommands.filter(command => command.status.toLowerCase() === 'en cours').length;
      const enAttente = updatedCommands.filter(command => command.status.toLowerCase() === 'en attente').length;

      setPieChartData([
        { name: 'En cours', value: enCours, color: '#4CAF50' }, // Green
        { name: 'En attente', value: enAttente, color: '#BDBDBD' }, // Gray
      ]);
    };

    const fetchRestaurants = async () => {
      const restaurantCollection = collection(db, 'shopData');
      const restaurantSnapshot = await getDocs(restaurantCollection);
      const restaurantList = restaurantSnapshot.docs.map(doc => doc.data() as Restaurant);
      setRestaurantData(restaurantList);
    };

    fetchCommands();
    fetchRestaurants();
  }, []);

  const onPieEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="dashboard-container">
      <h3>Tableau de bord</h3>
      <Row gutter={[16, 16]}>
        {/* Métriques principales */}
        <Col span={6} id='total'>
        <Card title="Total des Commandes" bordered={false} style={{ border: "2px solid #4caf50" , borderRadius:"8px" , boxShadow:"0px 4px 8px rgba(0, 0, 0, 0.2"}} id='total'>
            <p>{topMetrics.totalCommands}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Revenu Total" bordered={false} id='revenu' style={{ border: "2px solid blue" , borderRadius:"8px" , boxShadow:"0px 4px 8px rgba(0, 0, 0, 0.2"}} >
            <p>{topMetrics.totalRevenue.toFixed(2)} €</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Total des Réductions" bordered={false} id='remise' style={{ border: "2px solid #F44336" , borderRadius:"8px" , boxShadow:"0px 4px 8px rgba(0, 0, 0, 0.2"}}>
            <p>{topMetrics.totalDiscounts.toFixed(2)} €</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Pourboire Moyen" bordered={false} id='pourboire' style={{ border: "2px solid #FF9800" , borderRadius:"8px" , boxShadow:"0px 4px 8px rgba(0, 0, 0, 0.2"}}>
            <p>{topMetrics.averageTip.toFixed(2)} €</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={12}>
          {/* Dynamic Pie Chart */}
          <Card title="Statut des commandes" bordered={false} className="chart-container">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                        style={{
                          filter: index === activeIndex ? `drop-shadow(0px 0px 6px ${entry.color})` : 'none',
                          transition: 'filter 0.3s ease',
                        }}
                      />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pie-center-text"
                  >
                    {activeIndex !== null
                      ? `${Math.round((pieChartData[activeIndex].value / topMetrics.totalCommands) * 100)}%`
                      : `${Math.round((pieChartData[0].value / topMetrics.totalCommands) * 100)}%`}
                  </text>
                  <text
                    x="50%"
                    y="65%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pie-subtext"
                  >
                    {activeIndex !== null
                      ? `${pieChartData[activeIndex].name}`
                      : 'En cours'}
                  </text>
                </PieChart>
              </ResponsiveContainer>
              <div className="legend-container" style={{ marginTop: '10px' }}>
                <span style={{ color: '#4CAF50' }}>● En cours</span> &nbsp;&nbsp;
                <span style={{ color: '#BDBDBD' }}>● En attente</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          {/* Restaurant Status */}
          <Card title="Liste des restaurants" bordered={false} className="chart-container" style={{ height: '400px', overflowY: 'auto' }}>
            <Table
              dataSource={restaurantData}
              pagination={false}
              locale={{ emptyText: 'Aucun restaurant trouvé' }}
              columns={[
                { title: 'Nom', dataIndex: 'name', key: 'name', align: 'center' },
                { title: 'Adresse', dataIndex: 'address', key: 'address', align: 'center' },
                { title: 'Disponibilité', dataIndex: 'available', key: 'available', align: 'center', render: available => available ? 'Ouvert' : 'Fermé' },
              ]}
              style={{ fontSize: '16px', textAlign: 'center' }} // Make text bigger and centered
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          {/* Commandes Récentes */}
          <Card title="Liste des commandes récentes" bordered={false} className="recent-orders-container">
            <Table
              dataSource={commandData.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()).slice(0, 5)}
              pagination={false}
              locale={{ emptyText: 'Aucune commande récente' }} // Display this when there's no data
              columns={[
                { title: 'ID Commande', dataIndex: 'id', key: 'id', align: 'center' },
                { title: 'Client', dataIndex: 'deliveryAddress', key: 'deliveryAddress', align: 'center' },
                { title: 'Statut', dataIndex: 'status', key: 'status', align: 'center' },
                { title: 'Prix Total', dataIndex: 'finalTotal', key: 'finalTotal', align: 'center' },
              ]}
              style={{ fontSize: '16px', textAlign: 'center' }} // Make text bigger and centered
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
